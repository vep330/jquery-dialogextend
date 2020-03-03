(function() {
  var $;

  $ = jQuery;

  $.widget("ui.dialogExtend", {
    version: "2.0.0",
    modes: {
      "collapse": {
        option: "collapsable",
        state: "collapsed"
      },
      "minimize": {
        option: "minimizable",
        state: "minimized"
      },
      "maximize": {
        option: "maximizable",
        state: "maximized"
      }

    },
    options: {
      "closable": true,
      "maximizable": false,
      "minimizable": false,
      "collapsable": false,

      "dblclick": false,
      "titlebar": false,
      "icons": {
        "close": "ui-icon-closethick",
        "restore": "ui-icon-newwin",
        "maximize": "ui-icon-extlink",
        "minimize": "ui-icon-minus",
        "collapse": "ui-icon-triangle-1-s"
      },
      "minimizeLocation": "left",
      "beforeMaximize": null,
      "beforeMinimize": null,
      "beforeRestore": null,
      "beforeCollapse": null,

      "load": null,
      "maximize": null,
      "minimize": null,
      "collapse": null,
      "restore": null
    },
    _create: function() {
      this._state = "normal";
      if (!$(this.element[0]).data("ui-dialog")) {
        $.error("jQuery.dialogExtend Error : Only jQuery UI Dialog element is accepted");
      }
      this._verifyOptions();
      this._initStyles();
      this._initButtons();
      this._toggleButtons();
      this._initTitleBar();
      this._setState("normal");
      this._on("load", function(e) {
        return console.log("test", e);
      });
      return this._trigger("load");
    },
    _setState: function(state) {
      $(this.element[0]).removeClass("ui-dialog-" + this._state).addClass("ui-dialog-" + state);
      return this._state = state;
    },
    _verifyOptions: function() {
      var _ref;

      if (this.options.dblclick && !(this.options.dblclick in this.modes)) {
        $.error("jQuery.dialogExtend Error : Invalid <dblclick> value '" + this.options.dblclick + "'");
        this.options.dblclick = false;
      }
      if (this.options.titlebar && ((_ref = this.options.titlebar) !== "none" && _ref !== "transparent")) {
        $.error("jQuery.dialogExtend Error : Invalid <titlebar> value '" + this.options.titlebar + "'");
        this.options.titlebar = false;
      }
      if (!this.options.minimizeLocation || ((_ref = this.options.minimizeLocation) !== 'left' && _ref !== 'right')) {
        $.error("jQuery.dialogExtend Error : Invalid <minimizeLocation> value '" + this.options.minimizeLocation + "'");
        this.options.minimizeLocation = "left";
      }
      return [];
    },
    _initStyles: function() {
      var style;

      if (!$(".dialog-extend-css").length) {
        style = '';
        style += '<style class="dialog-extend-css" type="text/css">';
        style += '.ui-dialog .ui-dialog-titlebar-restore { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-restore:hover,';
        style += '.ui-dialog .ui-dialog-titlebar-restore:focus { padding: 0; }';
        style += '.ui-dialog .ui-dialog-titlebar ::selection { background-color: transparent; }';
        style += '</style>';
        $(style).appendTo("body");
      }
      if (!$(".dialog-extend-collapse-css").length) {
        style = '';
        style += '<style class="dialog-extend-collapse-css" type="text/css">';
        style += '.ui-dialog .ui-dialog-titlebar-collapse { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-collapse:hover,';
        style += '.ui-dialog .ui-dialog-titlebar-collapse:focus { padding: 0; }';
        style += '</style>';
        $(style).appendTo("body");
      }
      if (!$(".dialog-extend-maximize-css").length) {
        style = '';
        style += '<style class="dialog-extend-maximize-css" type="text/css">';
        style += '.ui-dialog .ui-dialog-titlebar-maximize { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-maximize:hover,';
        style += '.ui-dialog .ui-dialog-titlebar-maximize:focus { padding: 0; }';
        style += '</style>';
        $(style).appendTo("body");
      }
      if (!$(".dialog-extend-minimize-css").length) {
        style = '';
        style += '<style class="dialog-extend-minimize-css" type="text/css">';
        style += '.ui-dialog .ui-dialog-titlebar-minimize { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-minimize:hover,';
        style += '.ui-dialog .ui-dialog-titlebar-minimize:focus { padding: 0; }';
        style += '</style>';
        $(style).appendTo("body");
      }
    },
    _initButtons: function() {
      var buttonPane, titlebar,
        _this = this;

      titlebar = $(this.element[0]).dialog("widget").find(".ui-dialog-titlebar");
      var $closeButton = titlebar.find('.ui-dialog-titlebar-close');
      buttonPane = $('<div class="ui-dialog-titlebar-buttonpane"></div>').appendTo(titlebar);
      buttonPane.css({
        "position": "absolute",
        "top": "50%",
        "right": "0.3em",
        "margin-top": "-10px",
        "height": "18px"
      });
      $closeButton.css({
        position: 'relative',
        margin: '1px'
      });
      $closeButton.find(".ui-icon").removeClass("ui-icon-closethick").addClass(this.options.icons.close);

      var $customButtons = [];
      var $restoreButton = $('<a class="ui-dialog-titlebar-restore ui-corner-all ui-state-default" href="#"><span class="ui-icon ' + this.options.icons.restore + '" title="restore">restore</span></a>');
      $restoreButton.click(function(e) {
        e.preventDefault();
        return _this.restore();
      });
      if (this.options.minimizeLocation === 'left') {
        $customButtons.push(this._initModuleButton('minimize', this.modes['minimize']));
        $customButtons.push(this._initModuleButton('maximize', this.modes['maximize']));
      } else {
        $customButtons.push(this._initModuleButton('maximize', this.modes['maximize']));
        $customButtons.push(this._initModuleButton('minimize', this.modes['minimize']));
      }
      $customButtons.push(this._initModuleButton('collapse', this.modes['collapse']));
      $customButtons.push($restoreButton);
      for (var i = 0; i < $customButtons.length; ++i) {
        var $b = $customButtons[i];
        $b.addClass('ui-button');
        if ($closeButton.hasClass('ui-button-icon-only')) {
          $b.addClass('ui-button-icon-only');
          $('.ui-icon', $b).text(''); // hide text even without jquery ui base css (Mapbender <= 3.0.8.5...)
        }
        $b.attr("role", "button").mouseover(function() {
          return $(this).addClass("ui-state-hover");
        }).mouseout(function() {
          return $(this).removeClass("ui-state-hover");
        }).focus(function() {
          return $(this).addClass("ui-state-focus");
        }).blur(function() {
          return $(this).removeClass("ui-state-focus");
        });
        buttonPane.append($b);
      }
      $closeButton.appendTo(buttonPane);
      $closeButton.toggle(this.options.closable);
    },
    _initModuleButton: function(name, mode) {
      var _this = this;

      var $button = $('<a class="ui-dialog-titlebar-' + name + ' ui-corner-all ui-state-default" href="#" title="' + name + '"><span class="ui-icon ' + this.options.icons[name] + '">' + name + '</span></a>');
      $button.click(function(e) {
        e.preventDefault();
        return _this[name]();
      });
      return $button;
    },
    _initTitleBar: function() {
      var handle;
      var _this = this;

      $('.ui-dialog-titlebar', this.element).dblclick(function(evt) {
        if (_this.options.dblclick) {
          if (_this._state !== "normal") {
            return _this.restore();
          } else {
            return _this[_this.options.dblclick]();
          }
        }
      }).select(function() {
        return false;
      });

      switch (this.options.titlebar) {
        case false:
          return 0;
        case "none":
          if ($(this.element[0]).dialog("option", "draggable")) {
            handle = $("<div />").addClass("ui-dialog-draggable-handle").css("cursor", "move").height(5);
            $(this.element[0]).dialog("widget").prepend(handle).draggable("option", "handle", handle);
          }
          return $(this.element[0]).dialog("widget").find(".ui-dialog-titlebar").find(".ui-dialog-title").html("&nbsp;").end().css({
            "background-color": "transparent",
            "background-image": "none",
            "border": 0,
            "position": "absolute",
            "right": 0,
            "top": 0,
            "z-index": 9999
          }).end();
        case "transparent":
          return $(this.element[0]).dialog("widget").find(".ui-dialog-titlebar").css({
            "background-color": "transparent",
            "background-image": "none",
            "border": 0
          });
        default:
          return $.error("jQuery.dialogExtend Error : Invalid <titlebar> value '" + this.options.titlebar + "'");
      }
    },
    state: function() {
      return this._state;
    },
    restore: function() {
      this._trigger("beforeRestore");
      this._restore();
      this._toggleButtons();
      return this._trigger("restore");
    },
    _restore: function() {
      if (this._state !== "normal") {
        this["_restore_" + this._state]();
        this._setState("normal");
        return $(this.element[0]).dialog("widget").focus();
      }
    },
    _saveSnapshot: function() {
      if (this._state === "normal") {
        this.original_config_resizable = $(this.element[0]).dialog("option", "resizable");
        this.original_config_draggable = $(this.element[0]).dialog("option", "draggable");
        this.original_size_height = $(this.element[0]).dialog("widget").outerHeight();
        this.original_size_width = $(this.element[0]).dialog("option", "width");
        this.original_size_maxHeight = $(this.element[0]).dialog("option", "maxHeight");
        this.original_position_mode = $(this.element[0]).dialog("widget").css("position");
        this.original_position_left = $(this.element[0]).dialog("widget").offset().left - $('body').scrollLeft();
        this.original_position_top = $(this.element[0]).dialog("widget").offset().top - $('body').scrollTop();
        return this.original_titlebar_wrap = $(this.element[0]).dialog("widget").find(".ui-dialog-titlebar").css("white-space");
      }
    },
    _loadSnapshot: function() {
      return {
        "config": {
          "resizable": this.original_config_resizable,
          "draggable": this.original_config_draggable
        },
        "size": {
          "height": this.original_size_height,
          "width": this.original_size_width,
          "maxHeight": this.original_size_maxHeight
        },
        "position": {
          "mode": this.original_position_mode,
          "left": this.original_position_left,
          "top": this.original_position_top
        },
        "titlebar": {
          "wrap": this.original_titlebar_wrap
        }
      };
    },
    _toggleButtons: function(newstate) {
      var state = newstate || this._state;
      var $titleBar = $('.ui-dialog-titlebar', this.element[0]);
      $('.ui-dialog-titlebar-collapse', $titleBar[0]).toggle(state !== 'collapsed' && this.options.collapsable);
      $('.ui-dialog-titlebar-minimize', $titleBar[0]).toggle(state !== 'minimized' && this.options.minimizable);
      $('.ui-dialog-titlebar-maximize', $titleBar[0]).toggle(state !== 'maximized' && this.options.maximizable);
      $('.ui-dialog-titlebar-restore', $titleBar[0]).toggle(state !== 'normal');
    },
    collapse: function() {
      var newHeight, pos;

      newHeight = $(this.element[0]).dialog("widget").find(".ui-dialog-titlebar").height() + 15;
      this._trigger("beforeCollapse");
      if (this._state !== "normal") {
        this._restore();
      }
      this._saveSnapshot();
      pos = $(this.element[0]).dialog("widget").position();
      $(this.element[0]).dialog("option", {
        "resizable": false,
        "height": newHeight,
        "maxHeight": newHeight,
        "position": [pos.left - $(document).scrollLeft(), pos.top - $(document).scrollTop()]
      }).on('dialogclose', this._collapse_restore).hide().dialog("widget").find(".ui-dialog-buttonpane:visible").hide().end().find(".ui-dialog-titlebar").css("white-space", "nowrap").end().find(".ui-dialog-content");
      this._setState("collapsed");
      this._toggleButtons();
      return this._trigger("collapse");
    },
    _restore_collapsed: function() {
      var original;

      original = this._loadSnapshot();
      return $(this.element[0]).show().dialog("widget").find(".ui-dialog-buttonpane:hidden").show().end().find(".ui-dialog-titlebar").css("white-space", original.titlebar.wrap).end().find(".ui-dialog-content").dialog("option", {
        "resizable": original.config.resizable,
        "height": original.size.height,
        "maxHeight": original.size.maxHeight
      }).off('dialogclose', this._collapse_restore);
    },
    _collapse_restore: function() {
      return $(this).dialogExtend("restore");
    },
    maximize: function() {
      var newHeight, newWidth;

      newHeight = $(window).height() - 11;
      newWidth = $(window).width() - 11;
      this._trigger("beforeMaximize");
      if (this._state !== "normal") {
        this._restore();
      }
      this._saveSnapshot();
      if ($(this.element[0]).dialog("option", "draggable")) {
        $(this.element[0]).dialog("widget").draggable("option", "handle", null).find(".ui-dialog-draggable-handle").css("cursor", "text").end();
      }
      $(this.element[0]).dialog("widget").css("position", "fixed").find(".ui-dialog-content").show().dialog("widget").find(".ui-dialog-buttonpane").show().end().find(".ui-dialog-content").dialog("option", {
        "resizable": false,
        "draggable": false,
        "height": newHeight,
        "width": newWidth,
        "position": {
          my: "left top",
          at: "left top",
          of: window
        }
      });
      this._setState("maximized");
      this._toggleButtons();
      return this._trigger("maximize");
    },
    _restore_maximized: function() {
      var original;

      original = this._loadSnapshot();
      $(this.element[0]).dialog("widget").css("position", original.position.mode).find(".ui-dialog-titlebar").css("white-space", original.titlebar.wrap).end().find(".ui-dialog-content").dialog("option", {
        "resizable": original.config.resizable,
        "draggable": original.config.draggable,
        "height": original.size.height,
        "width": original.size.width,
        "maxHeight": original.size.maxHeight,
        "position": {
          my: "left top",
          at: "left+" + original.position.left + " top+" + original.position.top,
          of: window
        }
      });
      if ($(this.element[0]).dialog("option", "draggable")) {
        return $(this.element[0]).dialog("widget").draggable("option", "handle", $(this.element[0]).dialog("widget").find(".ui-dialog-draggable-handle").length ? $(this.element[0]).dialog("widget").find(".ui-dialog-draggable-handle") : ".ui-dialog-titlebar").find(".ui-dialog-draggable-handle").css("cursor", "move");
      }
    },
    minimize: function() {
      var dialogcontrols, fixedContainer, newWidth;

      this._trigger("beforeMinimize");
      if (this._state !== "normal") {
        this._restore();
      }
      newWidth = 200;
      if ($("#dialog-extend-fixed-container").length) {
        fixedContainer = $("#dialog-extend-fixed-container");
      } else {
        fixedContainer = $('<div id="dialog-extend-fixed-container"></div>').appendTo("body");
        fixedContainer.css({
          "position": "fixed",
          "bottom": 1,
          "left": 1,
          "right": 1,
          "z-index": 9999
        });
      }
      this._toggleButtons("minimized");
      dialogcontrols = $(this.element[0]).dialog("widget").clone().children().remove().end();
      $(this.element[0]).dialog("widget").find('.ui-dialog-titlebar').clone(true, true).appendTo(dialogcontrols);
      dialogcontrols.css({
        "float": this.options.minimizeLocation,
        "margin": 1
      });
      fixedContainer.append(dialogcontrols);
      $(this.element[0]).data("dialog-extend-minimize-controls", dialogcontrols);
      if ($(this.element[0]).dialog("option", "draggable")) {
        dialogcontrols.removeClass("ui-draggable");
      }
      dialogcontrols.css({
        "height": "auto",
        "width": newWidth,
        "position": "static"
      });
      $(this.element[0]).on('dialogbeforeclose', this._minimize_restoreOnClose).dialog("widget").hide();
      this._setState("minimized");
      return this._trigger("minimize");
    },
    _restore_minimized: function() {
      $(this.element[0]).dialog("widget").show();
      $(this.element[0]).off('dialogbeforeclose', this._minimize_restoreOnClose);
      $(this.element[0]).data("dialog-extend-minimize-controls").remove();
      return $(this.element[0]).removeData("dialog-extend-minimize-controls");
    },
    _minimize_restoreOnClose: function() {
      return $(this).dialogExtend("restore");
    }
  });

})();
