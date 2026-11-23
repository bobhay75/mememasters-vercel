#!/usr/bin/env python3
"""Fail closed if the static studio loses its local-only release contract."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
APP = (ROOT / 'app.mjs').read_text(encoding='utf-8')
CORE = (ROOT / 'editor-core.mjs').read_text(encoding='utf-8')

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.assets = []
        self.inline_scripts = 0
        self.script_tags = 0
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if 'id' in data:
            assert data['id'] not in self.ids, 'Duplicate HTML id: ' + data['id']
            self.ids.add(data['id'])
        if tag == 'script':
            self.script_tags += 1
            if not data.get('src'):
                self.inline_scripts += 1
            else:
                assert data.get('type') == 'module', 'Only local ES modules are supported'
                self.assets.append(data['src'])
        if tag == 'link' and data.get('rel') == 'stylesheet':
            self.assets.append(data['href'])
        if tag == 'a' and data.get('target') == '_blank':
            rel = set(data.get('rel', '').split())
            assert {'noopener', 'noreferrer'} <= rel, 'External tabs must be isolated'
        if tag == 'input' and data.get('type') == 'password':
            assert not data.get('value'), 'No preset password values'
        if tag == 'input' and data.get('type') == 'file':
            assert data.get('accept') == 'image/jpeg,image/png,image/webp'

parser = Inspector()
parser.feed(HTML)
assert parser.inline_scripts == 0, 'No inline script permitted by the CSP'
assert parser.script_tags == 1, 'Use exactly one local module entry point'
for name in parser.assets:
    assert not name.startswith(('http://', 'https://', '/', '//')), 'Only relative local assets are permitted'
    assert (ROOT / name.removeprefix('./')).is_file(), 'Missing site asset: ' + name
required = {'photo', 'top-caption', 'bottom-caption', 'font-size',
            'image-fit', 'canvas-size', 'meme-preview', 'download',
            'reset', 'editor-status', 'file-selection'}
assert required <= parser.ids, 'Missing app controls: ' + str(required - parser.ids)
assert "connect-src 'none'" in HTML, 'CSP must block external network requests'
assert 'MAX_FILE_BYTES = 12 * 1024 * 1024' in APP
assert 'ALLOWED_MIME' in APP and 'URL.revokeObjectURL' in APP
assert 'image/png' in APP and 'safeFilename' in APP
assert 'wrapCaption' in CORE and 'fitImage' in CORE
assert not re.search(r'(?i)(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,})', HTML + APP + CORE)
print('Static release contract passed: local assets/CSP, accessible controls, file safety, PNG export, no embedded credentials.')
