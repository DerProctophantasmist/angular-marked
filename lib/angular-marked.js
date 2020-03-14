/*
 * angular-marked
 * (c) 2014 - 2016 J. Harshbarger
 * Licensed MIT
 */

/* global angular, marked */

'use strict';

var unindent = require('./strip-indent');

  /**
   * @ngdoc overview
   * @name index
   *
   * @description
   * AngularJS Markdown using [marked](https://github.com/chjj/marked).
   *
   * ## Why?
   *
   * I wanted to use [marked](https://github.com/chjj/marked) instead of [showdown](https://github.com/coreyti/showdown) as used in [angular-markdown-directive](https://github.com/btford/angular-markdown-directive) as well as expose the option to globally set defaults.
   *
   * ## How?
   *
   * - {@link hc.marked.directive:marked As a directive}
   * - {@link hc.marked.service:marked As a service}
   * - {@link hc.marked.service:markedProvider Set default options}
   *
   * @example

      Convert markdown to html at run time.  For example:

      <example module="app">
        <file name="example.html">
          <form ng-controller="MainController">
            Markdown:<br />
            <textarea ng-model="my_markdown" cols="60" rows="5" class="span8"></textarea><br />
            Output:<br />
            <div marked="my_markdown" />
          </form>
        </file>
        <file  name="example.js">
          function MainController($scope) {
            $scope.my_markdown = "*This* **is** [markdown](https://daringfireball.net/projects/markdown/)";
          }
          angular.module('app', ['hc.marked']).controller('MainController', MainController);
        </file>
      </example>

    *
    */

    /**
     * @ngdoc overview
     * @name hc.marked
     * @description # angular-marked (core module)
       # Installation
      First include angular-marked.js in your HTML:

      ```js
        <script src="angular-marked.js">
      ```

      Then load the module in your application by adding it as a dependency:

      ```js
      angular.module('yourApp', ['hc.marked']);
      ```

      With that you're ready to get started!
     */

    /**
    * @ngdoc service
    * @name hc.marked.service:marked
    * @requires $window
    * @description
    * A reference to the [marked](https://github.com/chjj/marked) parser.
    *
    * @example
    <example module="app">
      <file name="example.html">
        <div ng-controller="MainController">
          html: {{html}}
        </div>
      </file>
      <file  name="example.js">
        function MainController($scope, marked) {
          $scope.html = marked('#TEST');
        }
        angular.module('app', ['hc.marked']).controller('MainController', MainController);
      </file>
    </example>
   **/

   /**
   * @ngdoc service
   * @name hc.marked.service:markedProvider
   * @description
   * Use `markedProvider` to change the default behavior of the {@link hc.marked.service:marked marked} service.
   *
   * @example

    ## Example using [google-code-prettify syntax highlighter](https://code.google.com/p/google-code-prettify/) (must include google-code-prettify.js script).  Also works with [highlight.js Javascript syntax highlighter](http://highlightjs.org/).

    <example module="myAppA">
      <file name="exampleA.js">
      angular.module('myAppA', ['hc.marked'])
        .config(['markedProvider', function(markedProvider) {
          markedProvider.setOptions({
            gfm: true,
            tables: true,
            highlight: function (code) {
              return prettyPrintOne(code);
            }
          });
        }]);
      </file>
      <file name="exampleA.html">
        <marked>
        ```js
        angular.module('myAppA', ['hc.marked'])
          .config(['markedProvider', function(markedProvider) {
            markedProvider.setOptions({
              gfm: true,
              tables: true,
              highlight: function (code) {
                return prettyPrintOne(code);
              }
            });
          }]);
        ```
        </marked>
      </file>
    </example>

    ## Example overriding the way custom markdown links are displayed

    <example module="myAppB">
      <file name="exampleB.js">
      angular.module('myAppB', ['hc.marked'])
        .config(['markedProvider', function(markedProvider) {
          markedProvider.setRenderer({
            link: function(href, title, text) {
              return "<a href='" + href + "'" + (title ? " title='" + title + "'" : '') + " target='_blank'>" + text + "</a>";
            }
          });
        }]);
      </file>
      <file name="exampleB.html">
        <marked>
          This is [an example](http://example.com/ "Title") inline link.
          [This link](http://example.net/) has no title attribute.
        </marked>
      </file>
    </example>
  **/

function markedProvider() {
  var self = this;

  /**
   * @ngdoc method
   * @name markedProvider#setRenderer
   * @methodOf hc.marked.service:markedProvider
   *
   * @param {object} opts Default renderer options for [marked](https://github.com/chjj/marked#overriding-renderer-methods).
   */

  self.setRenderer = function (opts) {
    this.renderer = opts;
  };
  
  self.setDataPath = function(path) {
      this.dataPath = path;
  };

  /**
   * @ngdoc method
   * @name markedProvider#setOptions
   * @methodOf hc.marked.service:markedProvider
   *
   * @param {object} opts Default options for [marked](https://github.com/chjj/marked#options-1).
   */

  self.setOptions = function (opts) {  // Store options for later
    this.defaults = opts;
  };

  self.$get = ['$log', '$window', function ($log, $window) {
    var m;

    try {
      m = require('marked');
    } catch (err) {
      m = $window.marked || marked;
    }

    if (angular.isUndefined(m)) {
      $log.error('angular-marked Error: marked not loaded.  See installation instructions.');
      return;
    }

    var r = new m.Renderer();

    // override rendered markdown html
    // with custom definitions if defined
    if (self.renderer) {
      var o = Object.keys(self.renderer);
      var l = o.length;

      while (l--) {
        r[o[l]] = self.renderer[o[l]];
      }
    }

    //I'm pirating the code block for other purposes, so I don't want that.
    // Customize code and codespan rendering to wrap default or overriden output in a ng-non-bindable span
    // function wrapNonBindable(string) {
    //   return '<span ng-non-bindable>' + string + '</span>';
    // }

    // var renderCode = r.code.bind(r);
    // r.code = function (code, lang, escaped) {
    //   return wrapNonBindable(renderCode(code, lang, escaped));
    // };
    // var renderCodespan = r.codespan.bind(r);
    // r.codespan = function (code) {
    //   return wrapNonBindable(renderCodespan(code));
    // };

    // add the new renderer to the options if need be
    self.defaults = self.defaults || {};
    self.defaults.renderer = r;

    m.setOptions(self.defaults);
    m.dataPath = self.dataPath ? self.dataPath : "";

    return m;
  }];
}

  // xTODO: filter and tests */
  // app.filter('marked', ['marked', function(marked) {
  //   return marked;
  // }]);

  /**
   * @ngdoc directive
   * @name hc.marked.directive:marked
   * @restrict AE
   * @element any
   *
   * @description
   * Compiles source test into HTML.
   *
   * @param {expression=} marked The source text to be compiled.  If blank uses content as the source.
   * @param {expression=} opts Hash of options that override defaults.
   * @param {boolean=} compile Set to true to to support AngularJS directives inside markdown.
   * @param {string=} src Expression evaluating to URL. If the source is a string constant,
   *                 make sure you wrap it in **single** quotes, e.g. `src="'myPartialTemplate.html'"`.
   *
   * @example

     ## A simple block of text

      <example module="hc.marked">
        <file name="exampleA.html">
         * <marked>
         *   ### Markdown directive
         *
         *   *It works!*
         *
         *   *This* **is** [markdown](https://daringfireball.net/projects/markdown/) in the view.
         * </marked>
        </file>
      </example>

     ## Bind to a scope variable

      <example module="app">
        <file name="exampleB.html">
          <form ng-controller="MainController">
            Markdown:<br />
            <textarea ng-model="my_markdown" class="span8" cols="60" rows="5"></textarea><br />
            Output:<br />
            <blockquote marked="my_markdown"></blockquote>
          </form>
        </file>
        <file  name="exampleB.js">
          * function MainController($scope) {
          *     $scope.my_markdown = '*This* **is** [markdown](https://daringfireball.net/projects/markdown/)';
          *     $scope.my_markdown += ' in a scope variable';
          * }
          * angular.module('app', ['hc.marked']).controller('MainController', MainController);
        </file>
      </example>

      ## Include a markdown file:

       <example module="hc.marked">
         <file name="exampleC.html">
           <div marked src="'include.html'" />
         </file>
         * <file name="include.html">
         * *This* **is** [markdown](https://daringfireball.net/projects/markdown/) in a include file.
         * </file>
       </example>
   */
markedDirective.$inject = ['marked', '$http', '$compile', 'Locale', 'State', 'MarkdownEditor', 'DataFile'];
function markedDirective(marked, $http, $compile, Locale, State, MarkdownEditor, DataFile) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      opts: '=',
      marked: '=',
      compile: '@',
      src: '=',
      filename: '='
    },
    link: function (scope, element, attrs) {
      
      element.css("position", "relative");


      // these are the callbacks functions for the editor, they are actually passed to the editor from the modal template through the content.edit function bellow
    

      scope.editor =  {
        shouldShow: function() {
            return State.showEditors && attrs.filename;
          },
      //dummy that will be replaced if/when we load a file
        open: function() {
            alert("Can't edit " + scope.localizedFilename + " yet, wait until it is loaded.");
          }
      };
      
      var localizeFilename = function(filename) {
        if (filename.substr(-3) !== '.md') {
          filename = filename + '.' + Locale.get().language + '.md';
        }
        //we store it on the content so that the markdown editor button can correctly display the name of the file, doing it guarantees that it is always "up to date"
        scope.localizedFilename = filename;
        filename = filename;
        return filename;
      };

      
      function onChange(markdown) {
        // console.log("Markdown Editor change:\n" + markdown);
        set(markdown);
        scope.data = markdown
        scope.$apply();
      }

      function onSuccess(content) {
        scope.editor.open = function() {
          console.log("stored data for " +scope.localizedFilename +  ":\n" + scope.data)
          MarkdownEditor.open(scope.localizedFilename,scope.data) 

        }
        scope.data = content
        set(content);

      }
      var fileCallbacks = {
        onChange: onChange,
        on404:onSuccess,
        onError: function () {            
          alert("There was a problem loading " + scope.localizedFilename + " editor is disabled.");
        },
        onSuccess:onSuccess
      }
      var getContent = function (filename) {
            DataFile.read(filename, fileCallbacks, scope);
      };


      if (attrs.marked) {
        set(scope.marked);
        scope.$watch('marked', set);
      } 
      else if (attrs.src) {
        scope.$watch('src', function (src) {
            getContent(src);
        });
      } 
      else if (attrs.filename) {
        var localeListener = null
        scope.$watch('filename', function (filename) {
          var file;
          if (localeListener) //filename has changed, it could be locale independent (i.e end with .md), remove the listener
            Locale.offChange(localeListener);
          if (filename == null) {
            set('');
            return;
          }

          file = localizeFilename(filename);
          if (filename.substr(-3) !== '.md') {//file is Locale specific, add a listener
              localeListener = function(){getContent(localizeFilename(filename));}
              Locale.onChange(localeListener)
          }
          getContent(file);

        });
      } 
      else {
        set(element.text());
      }

      //this is nuts: it is transclusion by hand instead of using the option already provided with angularjs directives and components
      //that said the variation I have introduced is that the editor <a> element does use the child scope and not the parent one (i.e it is not transcluded
      //contrarily to the rest of the content), but I believe that putting it in the directive template would result in the same thing (have to test),
      function set(text) {
        // text = unindent(String(text || ''));
        element.html(marked(String(text || ''), scope.opts || null));
        if (scope.$eval(attrs.compile)) {
          $compile(element.contents())(scope.$parent);        
        }

        // var html = marked(text, scope.opts || null);
        // if (scope.$eval(attrs.compile)) {
        //   html = $compile(html)(scope.$parent);        
        // }
        // console.log(html)
        // element.empty();
        // element.append(html);

        if(attrs.filename) {
          var html = '<a ng-if="editor.shouldShow()"  ng-click="editor.open()" class="btn-floating btn-default btn" style="position:absolute;top:0%;color:black;z-index:1000">\
<i class="fa fa-edit" style="color:black"></i>\
<span  style="color:black">{{localizedFilename}}</span>\
</a>'
          element.append($compile(html)(scope));
        }
        // scope.$apply()
      }
    }
  };
}

module.exports =
  angular.module('hc.marked', [])
    .directive('marked', markedDirective)
    .provider('marked', markedProvider)
    .name;
