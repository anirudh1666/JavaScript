# Used to solve the CORS error when trying to load the sprite sheet from local machine.
# The CORS error is thrown when your frontend is receiving a HTTP request from the backend/server
# and the returned HTTP request has the "Access-Control-Allow-Origin" set to null. This means that
# if the image is not in the same place as the frontend, we can't access it. CORS is used to prevent
# the cross site forgery attack which involves using your cookies to hack into accounts.

# In this case, our sprite sheet is file://localhost whereas our website is http://localhost.
# To resolve this error, we first host this folder on our machine so that it is file://localhost ->
# http://localhost. Then we set the Access-Control-Allow-Origin header to all (*).

# Run this script in the command line before running the maze game.
# type: python simple_cors_http_server.py

from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):

        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleHTTPRequestHandler.end_headers(self)

# If this module is imported, then __name__ is set to simple_cors_http_server. This prevents
# the script from automatically running when imported. The if statement only allows this script
# to automatically run if it is called from the command line (then __name__ is set to __main__).
if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
