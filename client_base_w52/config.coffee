exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  files:
    javascripts:
      defaultExtension: 'coffee'
      joinTo:
        'javascripts/app.js'    : /^app/
        'javascripts/vendor.js' : /^vendor/
      order:
        before: [
          'vendor/scripts/iscroll.js'
          'vendor/scripts/msgpack.js'
          'vendor/scripts/rjson.js'
        ]

    stylesheets:
      defaultExtension: 'styl'
      joinTo: 'stylesheets/app.css'
      order:
        before : ['vendor/styles/normalize.css']
        after  : ['vendor/styles/helpers.css'  ]

    templates:
      defaultExtension: 'hbs'
      joinTo: 'javascripts/app.js'

