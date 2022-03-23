#!/bin/sh
aws s3 sync dist s3://dev-input.embeddable.graphics --acl public-read && \
aws cloudfront create-invalidation --distribution-id $STAGING_CLOUDFRONT_DIST --paths "/*"
