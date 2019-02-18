// Generated by CoffeeScript 1.8.0
(function() {
  var CMS, Events, Node, Page, Plugin, Search, Settings,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  console.log = function() {};

  Events = $({});

  Events.handler = (function(_this) {
    return function() {
      var event, params;
      event = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      console.log('Event', event.type);
      return Events.trigger(event.type, params);
    };
  })(this);

  Settings = (function() {
    Settings.prototype.keys = [];

    function Settings(defaults) {
      var def, key, value;
      for (key in defaults) {
        def = defaults[key];
        value = localStorage.getItem(key);
        if (value) {
          this.set(key, JSON.parse(value));
        } else {
          this.set(key, def);
        }
      }
    }

    Settings.prototype.get = function(key) {
      return this[key];
    };

    Settings.prototype.set = function(key, value) {
      console.log("Settings.set " + key + " = " + value);
      if (__indexOf.call(this.keys, key) < 0) {
        this.keys.push(key);
      }
      this[key] = value;
      return localStorage.setItem(key, value);
    };

    Settings.prototype.toggle = function(key) {
      return this.set(key, !this.get(key));
    };

    return Settings;

  })();

  Node = (function() {
    Node.prototype.selected = false;

    function Node(uri, data, container) {
      this.select = __bind(this.select, this);
      this.uri = uri.to_uri();
      this.data = data;
      this.$el = $("span[data-i18n='" + (this.id()) + "']", container);
      this.preview = this.$el.length > 0;
      if (this.preview) {
        this.$outline = $('<div class="djedi-node-outline">');
        this.$outline.on('click', this.select);
        $('body', container).append(this.render());
      }
    }

    Node.prototype.id = function() {
      return this.uri.namespace + '@' + this.uri.path;
    };

    Node.prototype.getContent = function() {
      if (this.preview) {
        return (this.$el.html() || '').trim();
      } else {
        return '';
      }
    };

    Node.prototype.setContent = function(content, silent) {
      if (this.preview) {
        if (typeof content === "string") {
          content = $($.parseHTML(content));
        }
        this.$el.html(content);
        return this.render();
      }
    };

    Node.prototype.render = function() {
      var bottom, c, child, children, firstChild, left, offset, padding, right, top, _i, _len, _ref, _ref1;
      if (!this.preview) {
        return;
      }
      console.log('Node.render');
      children = this.$el.children();
      firstChild = children[0];
      if (firstChild) {
        this.bounds = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        };
        _ref = (function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = children.length; _j < _len; _j++) {
            c = children[_j];
            _results.push($(c));
          }
          return _results;
        })();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _ref1 = child.offset(), top = _ref1.top, left = _ref1.left;
          right = left + child.outerWidth();
          bottom = top + child.outerHeight();
          if (this.bounds.left === 0 || left < this.bounds.left) {
            this.bounds.left = left;
          }
          if (this.bounds.top === 0 || top < this.bounds.top) {
            this.bounds.top = top;
          }
          if (right > this.bounds.right) {
            this.bounds.right = right;
          }
          if (bottom > this.bounds.bottom) {
            this.bounds.bottom = bottom;
          }
        }
        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;
      } else {
        offset = this.$el.offset();
        this.bounds = {
          left: offset.left,
          top: offset.top,
          width: this.$el.outerWidth(true),
          height: this.$el.outerHeight(true)
        };
      }
      padding = 5;
      this.bounds.left -= padding;
      this.bounds.top -= padding;
      this.bounds.width += padding * 2;
      this.bounds.height += padding * 2;
      this.$outline.css(this.bounds);
      return this.$outline;
    };

    Node.prototype.select = function() {
      if (this.preview) {
        this.selected = true;
        this.$outline.addClass('selected');
        console.log('select node');
        Events.trigger('node:edit', this);
      }
      return this;
    };

    Node.prototype.deselect = function() {
      if (this.preview) {
        this.selected = false;
        this.$outline.removeClass('selected');
      }
      return this;
    };

    return Node;

  })();

  Search = (function() {
    function Search() {
      this.$result = $('#search-result');
    }

    Search.prototype.addNodes = function(nodes) {
      var groups, node, uri, _i, _len, _results;
      nodes = (function() {
        var _results;
        _results = [];
        for (uri in nodes) {
          node = nodes[uri];
          _results.push(node);
        }
        return _results;
      })();
      nodes.sort(function(n1, n2) {
        if (n1.uri.path < n2.uri.path) {
          return -1;
        } else {
          return 1;
        }
      });
      groups = {};
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push((function(_this) {
          return function(node) {
            var $group, $item, $panel, color, lang, part, parts, path, root;
            uri = node.uri;
            color = (uri.ext[0].toUpperCase().charCodeAt() - 65) % 5 + 1;
            parts = (function() {
              var _j, _len1, _ref, _results1;
              _ref = uri.path.split('/');
              _results1 = [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                part = _ref[_j];
                if (part !== '') {
                  _results1.push((part.slice(0, 1).toUpperCase() + part.slice(1)).replace(/[_-]/g, ' '));
                }
              }
              return _results1;
            })();
            path = parts.slice(1).join(" <span class=\"plugin-fg-" + color + "\">/</span> ");
            lang = uri.namespace;
            if (uri.scheme === 'i18n') {
              lang = lang.split('-')[0];
            }
            root = parts[0];
            if (!groups[root]) {
              $panel = $("<div class=\"panel panel-default\">\n  <a class=\"panel-heading accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#search-result\" href=\"#node-group-" + (root.toLowerCase()) + "\">\n    <h4 class=\"panel-title\">\n      <i class=\"icon-chevron-sign-down\"></i> " + root + "\n    </h4>\n  </a>\n</div>");
              $group = $("<ul id=\"node-group-" + (root.toLowerCase()) + "\" class=\"panel-collapse collapse list-unstyled\">");
              groups[root] = $group;
              $panel.append($group);
              _this.$result.append($panel);
            }
            $item = $("<li class=\"node-title\">\n  <div class=\"plugin plugin-fg-" + color + "\">" + uri.ext + "</div>\n  <div class=\"flag flag-" + lang + "\"></div>\n  <span class=\"uri\">" + path + "</span>\n</li>");
            $item.on('click', function() {
              return Events.trigger('node:edit', node);
            });
            return groups[root].append($item);
          };
        })(this)(node));
      }
      return _results;
    };

    return Search;

  })();

  Page = (function() {
    function Page(window) {
      var data, uri, _ref;
      this.window = window;
      this.renderNodes = __bind(this.renderNodes, this);
      this.updateNode = __bind(this.updateNode, this);
      this.win = window;
      this.doc = this.win.document;
      this.$doc = $(this.doc);
      this.$el = $('html', this.doc);
      this.$cms = $('#djedi-cms', this.doc);
      this.nodes = {};
      _ref = this.win.DJEDI_NODES;
      for (uri in _ref) {
        data = _ref[uri];
        this.nodes[uri] = new Node(uri, data, this.doc);
      }
      Events.on('node:render', this.updateNode);
      Events.on('node:resize', this.renderNodes);
    }

    Page.prototype.updateNode = function(event, uri, content) {
      uri = uri.to_uri();
      uri.version = null;
      uri = uri.valueOf();
      this.nodes[uri].setContent(content);
      return this.renderNodes();
    };

    Page.prototype.renderNodes = function() {
      var node, uri, _ref, _results;
      _ref = this.nodes;
      _results = [];
      for (uri in _ref) {
        node = _ref[uri];
        _results.push(node.render());
      }
      return _results;
    };

    Page.prototype.showNodes = function() {
      return $('.djedi-node-outline', this.doc).show();
    };

    Page.prototype.hideNodes = function() {
      return $('.djedi-node-outline', this.doc).hide();
    };

    Page.prototype.shrink = function(width, animated) {
      var style;
      this.pageWidth = this.$el.width();
      style = {
        width: "" + (this.pageWidth - width) + "px"
      };
      if (animated) {
        return this.$el.animate(style, 100, (function(_this) {
          return function() {
            return _this.renderNodes();
          };
        })(this));
      } else {
        this.$el.css(style);
        return this.renderNodes();
      }
    };

    Page.prototype.unshrink = function(animated) {
      var style;
      style = {
        width: "" + this.pageWidth + "px"
      };
      if (animated) {
        return this.$el.animate(style, 100, (function(_this) {
          return function() {
            return _this.renderNodes();
          };
        })(this));
      } else {
        this.$el.css(style);
        return this.renderNodes();
      }
    };

    return Page;

  })();

  Plugin = (function() {
    function Plugin(node) {
      this.node = node;
      this.connect = __bind(this.connect, this);
      this.uri = this.node.uri.valueOf();
      this.$el = $('<iframe>');
      this.$el.attr('id', 'editor-iframe');
      this.$el.one('load', this.connect);
      this.navigate(this.uri);
    }

    Plugin.prototype.navigate = function(uri) {
      return this.$el.attr('src', document.location.pathname + ("node/" + (encodeURIComponent(encodeURIComponent(uri))) + "/editor"));
    };

    Plugin.prototype.connect = function() {
      console.log('Plugin.connect()');
      this.window = this.$el[0].contentWindow;
      if (!this.window.$) {
        alert('Failed to load node');
        return;
      }
      this.$doc = this.window.$(this.window.document);
      this.$doc.on('node:render', Events.handler);
      this.$doc.on('node:resize', Events.handler);
      return this.$doc.on('page:node:fetch', (function(_this) {
        return function(event, uri, callback) {
          return callback({
            data: _this.node.data,
            content: _this.node.getContent()
          });
        };
      })(this));
    };

    Plugin.prototype.close = function() {
      this.node.deselect();
      return this.$el.remove();
    };

    return Plugin;

  })();

  CMS = (function() {
    function CMS() {
      this.toggleOpen = __bind(this.toggleOpen, this);
      this.toggleFullscreen = __bind(this.toggleFullscreen, this);
      this.openEditor = __bind(this.openEditor, this);
      this.$body = $('body');
      this.panels = {
        editor: $('#editor-panel'),
        settings: $('#settings-panel')
      };
      this.settings = new Settings({
        livePreview: false,
        showOutlines: false,
        panelIsOpen: false
      });
      this.search = new Search;
      if (window.parent !== window) {
        this.embed();
      }
      Events.on('node:edit', this.openEditor);
      $('#brand').on('click', this.toggleOpen);
    }

    CMS.prototype.embed = function() {
      this.$body.addClass('embedded');
      this.embedded = true;
      this.page = new Page(window.parent);
      this.width = this.page.$cms.width();
      this.search.addNodes(this.page.nodes);
      $('#tab-close').removeClass('hide').on('click', this.toggleOpen);
      $('#fullscreen').removeClass('hide').on('click', this.toggleFullscreen);
      this.$body.append($('<div class="embed-shadow">'));
      this.openPanel('search');
      if (this.settings.panelIsOpen) {
        return this.open();
      } else {
        return this.close();
      }
    };

    CMS.prototype.openEditor = function(event, node) {
      if (this.plugin) {
        this.plugin.close();
      }
      this.plugin = new Plugin(node);
      this.panels.editor.append(this.plugin.$el);
      return this.openPanel('editor');
    };

    CMS.prototype.openPanel = function(name) {
      return $("header nav a[href=\"#" + name + "-panel\"]").tab('show');
    };

    CMS.prototype.isClosed = function() {
      return this.page.$cms.hasClass('closed');
    };

    CMS.prototype.toggleFullscreen = function(event) {
      var $icon;
      event.preventDefault();
      $icon = $('#fullscreen i');
      $icon.toggleClass('icon-resize-full icon-resize-small');
      this.page.$cms.toggleClass('fullscreen');
      return this.$body.toggleClass('embedded');
    };

    CMS.prototype.toggleOpen = function(event) {
      event.preventDefault();
      if (this.embedded) {
        return this.page.$cms.animate({
          right: "-" + this.width + "px"
        }, 100, (function(_this) {
          return function() {
            if (_this.isClosed()) {
              return _this.open(true);
            } else {
              return _this.close(true);
            }
          };
        })(this));
      }
    };

    CMS.prototype.open = function(animate) {
      this.page.shrink(this.width, animate);
      this.css({
        height: '100%'
      });
      this.css({
        right: 0
      }, animate);
      this.page.$cms.removeClass('closed');
      this.$body.removeClass('closed');
      this.$body.addClass('embedded open');
      this.page.showNodes();
      return this.settings.set('panelIsOpen', true);
    };

    CMS.prototype.close = function(animate) {
      var $brand, brandHeight, brandWidth;
      this.page.unshrink(animate);
      $brand = $('header');
      brandHeight = $brand.outerHeight(true);
      brandWidth = brandHeight;
      this.css({
        height: "" + brandHeight + "px"
      });
      this.css({
        right: "" + (brandWidth - this.width) + "px"
      }, animate);
      this.page.$cms.addClass('closed');
      this.page.$cms.removeClass('fullscreen');
      this.$body.addClass('closed');
      this.$body.removeClass('embedded open');
      this.page.hideNodes();
      return this.settings.set('panelIsOpen', false);
    };

    CMS.prototype.css = function(style, animated) {
      if (animated) {
        return this.page.$cms.animate(style, 100);
      } else {
        return this.page.$cms.css(style);
      }
    };

    return CMS;

  })();

  new CMS;

}).call(this);
