# ztgui
Zeroteir Gui


## install
After zerotier installation:

`pip install -r requirements.txt`

Find your zerotier `authtoken.secret`:

`sudo cat /var/lib/zerotier-one/authtoken.secret`

 Add to config.py as variable `ZT_AUTHTOKEN`


## run

`uvicorn zt:app --port 9994 --host 0.0.0.0 --reload`

or

`python3 zt.py`