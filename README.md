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

### Name of Kubik
Every Kubik's instance should contain `name` field.
When you add your kubik to application, it get `name`, and use it.
If your kubik doesn't contain `name`, `kubik.constructor.name.toLowerCase()` will be used.

### Attach and extract an application from different objects
If you need an application attached to some object in your kubik,
you can use the method `app.attach(object)` or static equivalent `App.attach(app, object)`.

You can extract application from any object (if application was attached)
by the static method `App.extract(object)`.

For example simplest HTTP Kubik with express:
```js
// Some middleware
const { App } = require('rubik-main');

const check = async (req, res, next) => {
  const app = App.extract(req);

  const { Users } = app.storage.models;

  try {
    const user = await Users.auth(req.body.login, req.body.password);
  } catch (err) {
    return next(err);
  }

  return next();
}

// ...
// ... preparing Kubik class
class HTTP extends Kubik {
  constructor() {
    this.expressApp = express();
  }

  up() {
    // Attach this.app to an req of express
    this.expressApp.use((req, res, next) => this.app.attach(req));
    // Another way this.expressApp.use((req, res, next) => App.attach(this.app, req));

    // add middleware which uses Rubik's application inside
    this.expressApp.use(check);

    this.expressApp.listen(80);
  }
}


// ...
// ... add Kubik's instance into the application
const app = new App();

app.add(new SomeStorageKubik());
app.add(new HTTP());
```

