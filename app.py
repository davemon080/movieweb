# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, session, abort, jsonify
import sqlite3, os, hashlib, io, time
from werkzeug.utils import secure_filename
from datetime import datetime

# Optional S3
USE_S3 = os.environ.get('USE_S3', '0') == '1'
if USE_S3:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

BASE_DIR = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
PHONES_FOLDER = os.path.join(UPLOAD_FOLDER, 'phones')
DESIGNS_FOLDER = os.path.join(UPLOAD_FOLDER, 'designs')
VIDEOS_FOLDER = os.path.join(UPLOAD_FOLDER, 'videos')

DB_PATH = os.path.join(BASE_DIR, 'data.db')

ALLOWED_IMAGE = {'png','jpg','jpeg','gif','webp'}
ALLOWED_VIDEO = {'mp4','webm','ogg'}
ALLOWED_FILES = ALLOWED_IMAGE.union({'pdf','zip'})

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-this')

# S3 configuration (if USE_S3)
S3_BUCKET = os.environ.get('AWS_S3_BUCKET')
S3_REGION = os.environ.get('AWS_REGION', 'us-east-1')
if USE_S3 and not S3_BUCKET:
    raise RuntimeError("USE_S3=1 set but AWS_S3_BUCKET not provided")

# --- Helpers for storage (local or S3) ---
def s3_client():
    if not USE_S3:
        return None
    return boto3.client('s3',
                        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
                        region_name=S3_REGION)

def upload_to_s3(fileobj, key, content_type):
    client = s3_client()
    try:
        client.upload_fileobj(
            Fileobj=fileobj,
            Bucket=S3_BUCKET,
            Key=key,
            ExtraArgs={'ACL':'public-read', 'ContentType': content_type}
        )
        url = f"https://{S3_BUCKET}.s3.amazonaws.com/{key}"
        return url
    except (BotoCoreError, ClientError) as e:
        app.logger.error("S3 upload failed: %s", e)
        return None

def save_file_storage(field_file, subfolder):
    """
    Saves a werkzeug FileStorage either locally (default) or to S3.
    Returns stored path or URL (for S3).
    """
    if not field_file:
        return None
    filename = secure_filename(field_file.filename)
    if filename == '':
        return None
    timestamp = int(time.time())
    key = f"{subfolder}/{timestamp}_{filename}"
    mimetype = field_file.mimetype or 'application/octet-stream'
    if USE_S3:
        # upload to s3
        fileobj = field_file.stream
        url = upload_to_s3(fileobj, key, mimetype)
        if url:
            return url
        else:
            # fallback to local
            pass

    # Local save
    dest_dir = os.path.join(app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(dest_dir, exist_ok=True)
    save_path = os.path.join(dest_dir, f"{timestamp}_{filename}")
    field_file.save(save_path)
    # return path relative to static/uploads for templates (we'll store relative path for local)
    rel = os.path.relpath(save_path, app.config['UPLOAD_FOLDER'])
    # For local files we'll store `uploads/<rel>` when serving via /static/uploads/<rel>
    return rel.replace("\\","/")

# --- DB init / migration ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # admin
    c.execute('''
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT
    );
    ''')
    # phones
    c.execute('''
    CREATE TABLE IF NOT EXISTS phones (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL,
        image TEXT,
        description TEXT,
        created_at TEXT
    );
    ''')
    # designs
    c.execute('''
    CREATE TABLE IF NOT EXISTS designs (
        id INTEGER PRIMARY KEY,
        title TEXT,
        price REAL,
        is_free INTEGER DEFAULT 0,
        image TEXT,
        file TEXT,
        created_at TEXT
    );
    ''')
    # videos (added poster column to support poster images)
    c.execute('''
    CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY,
        title TEXT,
        filename TEXT,
        poster TEXT,
        created_at TEXT
    );
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS about (
        id INTEGER PRIMARY KEY,
        content TEXT,
        cv_file TEXT
    );
    ''')

    # default admin
    c.execute('SELECT COUNT(*) FROM admin')
    if c.fetchone()[0] == 0:
        pwd = hashlib.sha256('changeme'.encode()).hexdigest()
        c.execute('INSERT INTO admin (username, password_hash) VALUES (?, ?)', ('admin', pwd))

    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- Auth helpers ---
def check_login(username, password):
    h = hashlib.sha256(password.encode()).hexdigest()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM admin WHERE username=? AND password_hash=?', (username, h))
    row = c.fetchone()
    conn.close()
    return bool(row)

def login_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get('admin'):
            return redirect(url_for('admin_login'))
        return fn(*a, **kw)
    return wrapper

# --- Routes ---
@app.context_processor
def inject_year():
    return {'year': datetime.utcnow().year}

@app.route('/')
def index():
    conn = get_db()
    phones = conn.execute('SELECT * FROM phones ORDER BY created_at DESC').fetchall()
    designs = conn.execute('SELECT * FROM designs ORDER BY created_at DESC').fetchall()
    videos = conn.execute('SELECT * FROM videos ORDER BY created_at DESC').fetchall()
    about = conn.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return render_template('index.html', phones=phones, designs=designs, videos=videos, about=about)

@app.route('/phones')
def phones_page():
    conn = get_db()
    phones = conn.execute('SELECT * FROM phones ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('phones.html', phones=phones)

@app.route('/designs')
def designs_page():
    conn = get_db()
    designs = conn.execute('SELECT * FROM designs ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('designs.html', designs=designs)

@app.route('/videos')
def videos_page():
    conn = get_db()
    videos = conn.execute('SELECT * FROM videos ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('videos.html', videos=videos)

@app.route('/about')
def about_page():
    conn = get_db()
    about = conn.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return render_template('about.html', about=about)

# lightweight search across phones & designs
@app.route('/search')
def search():
    q = request.args.get('q','').strip()
    conn = get_db()
    phones = []
    designs = []
    if q:
        like = f"%{q}%"
        phones = conn.execute('SELECT * FROM phones WHERE name LIKE ? ORDER BY created_at DESC', (like,)).fetchall()
        designs = conn.execute('SELECT * FROM designs WHERE title LIKE ? ORDER BY created_at DESC', (like,)).fetchall()
    conn.close()
    return render_template('search.html', query=q, phones=phones, designs=designs)

# admin & upload routes
@app.route('/admin/login', methods=['GET','POST'])
def admin_login():
    if request.method == 'POST':
        u = request.form.get('username')
        p = request.form.get('password')
        if check_login(u,p):
            session['admin'] = u
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials','danger')
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('admin_login'))

@app.route('/admin')
@login_required
def admin_dashboard():
    conn = get_db()
    phones = conn.execute('SELECT * FROM phones ORDER BY created_at DESC').fetchall()
    designs = conn.execute('SELECT * FROM designs ORDER BY created_at DESC').fetchall()
    videos = conn.execute('SELECT * FROM videos ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('admin_dashboard.html', phones=phones, designs=designs, videos=videos)

@app.route('/admin/upload_phone', methods=['GET','POST'])
@login_required
def upload_phone():
    if request.method == 'POST':
        name = request.form.get('name')
        price = request.form.get('price') or 0
        desc = request.form.get('description','')
        f = request.files.get('image')
        filename = save_file_storage(f, 'phones') if f else None
        conn = get_db()
        conn.execute('INSERT INTO phones (name, price, image, description, created_at) VALUES (?,?,?,?,?)',
                     (name, float(price), filename, desc, datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()
        flash('Phone uploaded','success')
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_upload_phone.html')

@app.route('/admin/upload_design', methods=['GET','POST'])
@login_required
def upload_design():
    if request.method == 'POST':
        title = request.form.get('title')
        price = request.form.get('price') or 0
        is_free = 1 if request.form.get('is_free')=='on' else 0
        fimg = request.files.get('image')
        ffile = request.files.get('file')
        imgname = save_file_storage(fimg, 'designs') if fimg else None
        filename = save_file_storage(ffile, 'designs') if ffile else None
        conn = get_db()
        conn.execute('INSERT INTO designs (title, price, is_free, image, file, created_at) VALUES (?,?,?,?,?,?)',
                     (title, float(price), is_free, imgname, filename, datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()
        flash('Design uploaded','success')
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_upload_design.html')

@app.route('/admin/upload_video', methods=['GET','POST'])
@login_required
def upload_video():
    """
    Now supports:
      - video file upload
      - optional poster image upload (thumbnail)
    Stores filename and poster (either S3 URL or local relative path).
    """
    if request.method == 'POST':
        title = request.form.get('title')
        fvideo = request.files.get('video')
        fposter = request.files.get('poster')  # new
        video_saved = save_file_storage(fvideo, 'videos') if fvideo else None
        poster_saved = save_file_storage(fposter, 'videos') if fposter else None
        conn = get_db()
        conn.execute('INSERT INTO videos (title, filename, poster, created_at) VALUES (?,?,?,?)',
                     (title, video_saved, poster_saved, datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()
        flash('Video uploaded','success')
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_upload_video.html')

@app.route('/admin/about', methods=['GET','POST'])
@login_required
def admin_about():
    if request.method == 'POST':
        content = request.form.get('content','')
        cv = request.files.get('cv')
        cvname = save_file_storage(cv, 'designs') if cv else None
        conn = get_db()
        conn.execute('INSERT INTO about (content, cv_file) VALUES (?,?)', (content, cvname))
        conn.commit()
        conn.close()
        flash('About updated','success')
        return redirect(url_for('admin_dashboard'))
    conn = get_db()
    about = conn.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    return render_template('admin_about.html', about=about)

# static uploads serving note:
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    # path relative to static/uploads
    full = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(full):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    # If using S3 we may store full URLs in DB, so this route won't handle those.
    abort(404)

if __name__ == '__main__':
    # ensure folders exist (local fallback)
    os.makedirs(PHONES_FOLDER, exist_ok=True)
    os.makedirs(DESIGNS_FOLDER, exist_ok=True)
    os.makedirs(VIDEOS_FOLDER, exist_ok=True)
    if not os.path.exists(DB_PATH):
        init_db()
    # If DB existed but missing 'poster' column, user should migrate (see notes).
    app.run(host='0.0.0.0', port=5000, debug=True)
