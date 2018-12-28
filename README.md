# Rubik
Rubik is a powerful library, for build extensible applications from small kubiks.

## Main concept
Rubik was born to create large applications that can be used not only independently, but also as a NodeJS module, in other applications. At the same time without hard work in development, extension and support.

Application in Rubik is a hub of Kubiks. Kubik is a small box with a small responsibility.
You can unite and combime kubiks, for the fast bootstraping, without parts that you don't need.

Example of Kubiks:
- Congfiguration
- Logging
- Mailing
- Storaging
- Transporting (HTTP, Websockets, etc)
- ...name it yourself

## Install
Using Yarn:
```sh
yarn add rubik-main
```

Using NPM:
```sh
npm install rubik-main
```

## Create and use App
```js
const Rubik = require('rubik-main');

const app = new Rubik.App();
app.add(new Rubik.Kubiks.Config());
app.add(new Rubik.Kubiks.Log());
// app.add(your kubiks) ...
```
Another way, add kubiks as an array:
```js
app.add([
  new Rubik.Kubiks.Config(),
  new Rubik.Kubiks.Log()
]);
```

or as constructor's arguments:
```js
const app = new Rubik.App([
  new Rubik.Kubiks.Config(),
  new Rubik.Kubiks.Log()
]);
```

## Create your own Kubik
A new Kubik should be inherited from the Kubik class.

There is only one additional requirement for Kubik. It should implement `up` method.

```js
const { Kubik } = require('rubik-main');

class MyKubik extends Kubik {
  async up() {
    // bootstrap your kubik
  }
}
```

We can add dependencies list to Kubik, and Rubik will check they existing.

```js
class MyKubik extends Kubik {
  constructor() {
    super();
    this.dependencies = ['config', 'log'];
  }

  up({ config, log }) {
    // do something with config and log
  }
}

// Or you can use prototype, for creating list once.
// MyKubik.prototype.dependencies = Object.freeze(['config', 'log']);
```

### Hooks
All Kubiks have a [hook system](https://github.com/ya-kostik/hooks-mixin).
You can use it, if you want.

### Method after
You can add `async` method `after` to your kubik, and after application will `up` all kubiks, it will call `after` methods if they exists.
