# Loopback Connector Firebase3

[![Build Status](https://travis-ci.org/Wiredcraft/loopback-connector-firebase3.svg?branch=master)](https://travis-ci.org/Wiredcraft/loopback-connector-firebase3) [![Coverage Status](https://coveralls.io/repos/github/Wiredcraft/loopback-connector-firebase3/badge.svg?branch=master)](https://coveralls.io/github/Wiredcraft/loopback-connector-firebase3?branch=master)

With Firebase SDK 3.x

### Notes

For TravisCI to work, we need to encrypt the file that contains the private key. See [a gist](https://gist.github.com/kzap/5819745).

Data is encrypted before add to Git:

```bash
# Encrypt
cat /dev/urandom | head -c 10000 | openssl sha1 > ./.secret
openssl aes-256-cbc -pass "file:./.secret" -in ./test/serviceAccount.json -out ./test/serviceAccount.json.enc -a
```

On Travis it can be decrypted with:

```bash
# Decrypt on Travis
openssl aes-256-cbc -pass "pass:${FIREBASE_ACCOUNT_PASS}" -in ./test/serviceAccount.json.enc -out ./test/serviceAccount.json -d -a
```
