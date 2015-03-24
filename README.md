# crt
**A self learning project.** 

To make myself comfortable with some methods and paradigms that are currently in style I decided to build this as a self learning project.
I'm building a simple news reader, starting with getting news stories from the Hacker News API.

Since the [Hacker News API](http://blog.ycombinator.com/hacker-news-api) is public, there is no need for authentication and that's why this is all client side. No need for server side validation before pulling data from the API.
The API uses Firebase, which is (really) fast.

Take a look: [http://elvispt.github.io/crt/](http://elvispt.github.io/crt/)

The stories are saved to localStorage, making it fast (on subsequent visits) but it will refresh the news. It's just the first load that takes time (around a second, but it also depends on your connection).

##Technology stack:

- Javascript ES5.1 (for now).
- [Angular v1.3.15]()
- [sprintf](https://github.com/alexei/sprintf.js) javascript library.
- [lodash](https://github.com/lodash/lodash) javascript utility library.
- Firebase client library v2.2.1
- [Bootstrap](http://getbootstrap.com/) v3.3.4
- Note: I don't remember where I got the function timeAgoFromEpochTime (app/utils.js).

**I can (most definitely will) change the way this project behaves (maybe add server side) or change the styling, technology stack probably multiple times.**
