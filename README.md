# Card Dav Play

Research on how to implement a card dav server.

## Making VCards

```shell
http :3001/contacts first_name="John" last_name="Appledoe" phones:='[{"types": ["VOICE", "pref", "CELL"],"number": "+31612345678"}]' nickname="Johnny" birthday="1987-09-27T08:30:00-06:00"
```

## Links

[RFC2426 vCard MIME Directory Profile](https://datatracker.ietf.org/doc/html/rfc2426)

[RFC6352 CardDAV: vCard Extensions to Web Distributed Authoring and Versioning (WebDAV)](https://datatracker.ietf.org/doc/html/rfc6352)
