(function() {
  var $;

  $ = jQuery;

  $.widget("ui.dialogExtend", {
    version: "2.0.4",
    options: {
      "closable": true,
      "maximizable": false,
      "minimizable": false,
      "collapsable": false,

      "dblclick": false,
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
      var self = this;

      this.element.on('popupdialogopen', function() {
        var $dialog =  self._getDialogElement();
        var $buttonPane = $('.ui-dialog-titlebar-buttonpane', $dialog);
        if ($buttonPane.length && ($buttonPane.css('float') !== 'none' || $buttonPane.css('position') !== 'absolute')) {
          // Add rules mostly equivalent to original (base theme) declaration for .ui-dialog-titlebar-close
          // see https://github.com/jquery/jquery-ui/blob/master/themes/base/dialog.css#L30
          $buttonPane.css({
            position: 'absolute',
            right: '.3em',
            top: '50%',
            'margin-top' : '-10px',
            'margin-bottom': '0',
            'margin-left': '0',
            'margin-right': '0',
            padding: '1px',
            // counter legacy Mapbender CSS rules
            float: 'none'
          });
        }
        var $closeButton = $('.ui-dialog-titlebar-close', $dialog);
        if ($closeButton.length && $closeButton.hasClass('ui-button-icon-only') && !(($closeButton.css('text-indent') || "").match(/^-999/))) {
          // No original jqueryui css loaded, lo-fi hide contained text
          // NOTE: unlike the original jqueryui method, this preserves glyph-based icon contents in child nodes
          var cbChildren = $closeButton.get(0).childNodes;
          if (cbChildren && cbChildren.length === 3 && cbChildren[2].nodeType === 3) {
            cbChildren[2].textContent = '';
          }
        }
        if ($closeButton.css('margin-top') === '-2px') {
          // SOMEONE (...vis-ui...) punched a bootstrap .close on the close button; undo the collateral rules
          $closeButton.css({
            'margin': '1px',
            float: 'none'
          });
        }
      });
      return this._trigger("load");
    },
    _getDialogElement: function() {
      return this.element.first().dialog("widget")
    },
    _setState: function(state) {
      $(this.element[0]).removeClass("ui-dialog-" + this._state).addClass("ui-dialog-" + state);
      this._getDialogElement().removeClass('jqdx-state-' + this._state).addClass("jqdx-state-" + state);
      return this._state = state;
    },
    _verifyOptions: function() {
      var validModes = ["collapse", "minimize", "maximize"];
      if (this.options.dblclick && validModes.indexOf(this.options.dblclick) === -1) {
        $.error("jQuery.dialogExtend Error : Invalid <dblclick> value '" + this.options.dblclick + "'");
        this.options.dblclick = false;
      }
      if (this.options.minimizeLocation !== 'left' && this.options.minimizeLocation !== 'right') {
        $.error("jQuery.dialogExtend Error : Invalid <minimizeLocation> value '" + this.options.minimizeLocation + "'");
        this.options.minimizeLocation = "left";
      }
    },
    _initStyles: function() {
      var style;

      if (!$(".dialog-extend-css").length) {
        style = '';
        style += '<style class="dialog-extend-css" type="text/css">';
        style += '.ui-dialog .ui-dialog-titlebar-restore { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-collapse { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-maximize { width: 19px; margin: 1px; display:inline-block; }';
        style += '.ui-dialog .ui-dialog-titlebar-minimize { width: 19px; margin: 1px; display:inline-block; }';
        //// collapsed
        // defeat direct element style with !important
        style += '.ui-dialog.jqdx-state-collapsed >*:not(.ui-dialog-titlebar) { display: none !important; }';
        style += '.ui-dialog.jqdx-state-collapsed >.ui-dialog-titlebar { white-space: nowrap; }'; // ...why?
        //// maximized
        // reposition to fill viewport, overruling draggable + resizable element styles
        style += '.ui-dialog.jqdx-state-maximized { position: fixed !important; left: 0 !important; top: 0 !important; width: auto !important; height: 100% !important; right: 0; }';
        style += '.ui-dialog.jqdx-state-maximized .ui-resizable-handle { display: none; }';
        style += '.ui-dialog.jqdx-state-maximized .ui-draggable-handle { cursor: auto; }';
        //// minimized
        style += '#dialog-extend-fixed-container { position: fixed; bottom: 1px; left: 1px; right: 1px; z-index: 9999; }';
        style += '#dialog-extend-fixed-container > .ui-dialog { margin: 1rem; }';
        // use important to overrule element styles generated by draggable + resizable
        style += '#dialog-extend-fixed-container > .ui-dialog { position: static !important; width: 200px !important; }';
        // defeat direct element style with !important
        style += '#dialog-extend-fixed-container > .ui-dialog >*:not(.ui-dialog-titlebar) { display:none !important; }';
        style += '</style>';
        $(style).appendTo("body");
      }
    },
    _initButtons: function() {
      var buttonPane, titlebar;

      titlebar = this._getDialogElement().find(".ui-dialog-titlebar");
      var $closeButton = titlebar.find('button.ui-dialog-titlebar-close');
      buttonPane = $('<div class="ui-dialog-titlebar-buttonpane"></div>').appendTo(titlebar);
      $closeButton.find(".ui-icon").removeClass("ui-icon-closethick").addClass(this.options.icons.close);

      var customButtonNames = [];
      if (this.options.minimizeLocation === 'left') {
        customButtonNames.push('minimize');
        customButtonNames.push('maximize');
      } else {
        customButtonNames.push('maximize');
        customButtonNames.push('minimize');
      }
      customButtonNames.push('collapse');
      customButtonNames.push('restore');
      for (var i = 0; i < customButtonNames.length; ++i) {
        var $b = this._initModuleButton(customButtonNames[i]);
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
    _initModuleButton: function(name) {
      var _this = this;

      var $button = $('<a class="ui-dialog-titlebar-' + name + ' ui-corner-all ui-state-default" href="#" title="' + name + '"><span class="ui-icon ' + this.options.icons[name] + '">' + name + '</span></a>');
      $button.click(function(e) {
        e.preventDefault();
        return _this[name]();
      });
      return $button;
    },
    _initTitleBar: function() {
      var _this = this;
      $('.ui-dialog-titlebar', this._getDialogElement()).dblclick(function() {
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
        return this._getDialogElement().focus();
      }
    },
    _saveSnapshot: function() {
      if (this._state === "normal") {
        var uiDialog = this._getDialogElement();
        var $body = $('body');
        var dialogOffset;
        this.original_config_resizable = $(this.element[0]).dialog("option", "resizable");
        this.original_config_draggable = $(this.element[0]).dialog("option", "draggable");
        this.original_size_height = uiDialog.outerHeight();
        this.original_size_width = $(this.element[0]).dialog("option", "width");
        this.original_size_maxHeight = $(this.element[0]).dialog("option", "maxHeight");
        this.original_position_mode = uiDialog.css("position");
        dialogOffset = uiDialog.offset();
        this.original_position_left = dialogOffset.left - $body.scrollLeft();
        this.original_position_top = dialogOffset.top - $body.scrollTop();
        this.original_titlebar_wrap = uiDialog.find(".ui-dialog-titlebar").css("white-space");
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
      this._trigger("beforeCollapse");
      this._restore();
      this._setState("collapsed");
      this._toggleButtons();
      return this._trigger("collapse");
    },
    _restore_collapsed: function() {
      // nothing to do
    },
    _disableDragAndResize: function() {
      var uiDialog = this._getDialogElement();
      if (this.options.draggable && typeof $.fn.draggable === 'function') {
        uiDialog.draggable("disable");
      }
      if (this.options.resizable && typeof $.fn.resizable === 'function') {
        uiDialog.resizable("disable");
      }
    },
    _restoreDragAndResize: function() {
      var uiDialog = this._getDialogElement();
      if (this.options.draggable && typeof $.fn.draggable === 'function') {
        uiDialog.draggable("enable");
      }
      if (this.options.resizable && typeof $.fn.resizable === 'function') {
        uiDialog.resizable("enable");
      }
    },
    maximize: function() {
      this._trigger("beforeMaximize");
      if (this._state !== "normal") {
        this._restore();
      }
      this._disableDragAndResize();
      this._setState("maximized");
      this._toggleButtons();
      return this._trigger("maximize");
    },
    _restore_maximized: function() {
      this._restoreDragAndResize();
    },
    minimize: function() {
      var fixedContainer;
      var uiDialog = this._getDialogElement();

      this._trigger("beforeMinimize");
      this._restore();
      fixedContainer = $("#dialog-extend-fixed-container");
      if (!fixedContainer.length) {
        fixedContainer = $('<div id="dialog-extend-fixed-container"></div>').appendTo("body");
      }
      this._toggleButtons("minimized");
      uiDialog.data('parent-before-minimize', uiDialog.parent().get(0));
      this._disableDragAndResize();
      uiDialog.detach();
      uiDialog.css({float: this.options.minimizeLocation});
      this._setState("minimized");
      uiDialog.appendTo(fixedContainer);

      return this._trigger("minimize");
    },
    _restore_minimized: function() {
      var uiDialog = this._getDialogElement();
      uiDialog.css({float: ''});
      var parent = uiDialog.data('parent-before-minimize');
      uiDialog.detach().appendTo(parent);
      this._restoreDragAndResize();
    }
  });

})();
