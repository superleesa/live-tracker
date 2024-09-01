from fastapi import FastAPI
from live_tracker.api.browser_routes import browser_router
from live_tracker.api.client_routes import client_router

app = FastAPI()

# Register the routers
app.include_router(browser_router, prefix="/browser")
app.include_router(client_router, prefix="/client")
