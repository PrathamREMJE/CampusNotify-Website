from django.utils.deprecation import MiddlewareMixin

class AllowIframeForMediaMiddleware(MiddlewareMixin):
    """
    Middleware to allow iframe embedding for media files by modifying
    or removing the X-Frame-Options header for media URLs.
    """

    def process_response(self, request, response):
        if request.path.startswith('/media/'):
            # Remove X-Frame-Options header to allow embedding
            if 'X-Frame-Options' in response:
                del response['X-Frame-Options']
        return response
