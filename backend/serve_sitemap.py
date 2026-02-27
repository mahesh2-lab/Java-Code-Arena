# Serve sitemap.xml dynamically from backend
from flask import Flask, Response
import os

app = Flask(__name__)


@app.route('/sitemap.xml')
def sitemap():
    sitemap_path = os.path.join(os.path.dirname(
        __file__), '../frontend/public/sitemap.xml')
    if not os.path.exists(sitemap_path):
        return Response('Not found', status=404)
    with open(sitemap_path, 'r', encoding='utf-8') as f:
        xml = f.read()
    return Response(xml, mimetype='application/xml')

# ...existing routes...


if __name__ == '__main__':
    app.run(debug=True)
