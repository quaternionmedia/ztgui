from fastapi import FastAPI, HTTPException
from starlette.staticfiles import StaticFiles
import config
from requests import get
from urllib.parse import urljoin

app = FastAPI()

@app.get('/zt/{endpoint}')
def getZT(endpoint: str):
    print('calling endpoint', endpoint)
    res = get(urljoin('http://127.0.0.1:9993/', endpoint), headers={'X-ZT1-Auth': config.ZT_AUTHTOKEN}) 
    if res.status_code == 200:
        return res.json()
    else:
        print('error processing request', res)
        raise HTTPException(res.status_code)

app.mount('/', StaticFiles(directory='website', html=True), name='dist')

if __name__ == '__main__':
    from uvicorn import run
    run(app, host='0.0.0.0', port=9994)