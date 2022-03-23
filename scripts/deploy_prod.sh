#!/bin/sh
aws s3 sync dist s3://input.embeddable.graphics --acl public-read && \
aws cloudfront create-invalidation --distribution-id $PROD_CLOUDFRONT_DIST --paths "/*"
