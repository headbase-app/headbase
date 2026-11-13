# Hyper
This package functionality to make imperatively creating HTML elements easier.

It is directly inspired by [hyperhype/hyperscript](https://github.com/hyperhype/hyperscript) and is built to have a pretty much identical API surface.

## Basic Example

```js
const container = h('div.container#hello',
  h('h1.title', "Hello World"),
  h('p.message', "This is a paragraph")
)
```

Creates the HTML:
```html
<div class="container" id="hello">
  <h1 class="title">Hello World!</h1>
  <p class="message">This is a paragraph</p>
</div>
```

Children passed to the `h()` function are automatically mounted into the parent element.
