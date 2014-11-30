;(function ($) {
  'use strict';

  // Store scrubber and timeline elements as constants
  var EL = $('*[data-scrubber]');
  var TIMELINE = templates().timeline;
  EL.append( TIMELINE );

  // State helpers
  var MOUSEDOWN = false;
  var IS_DRAGGING = false;
  var CONTEXT_LENGTH;
  var CURSOR_POS;

  // Any data that the timeline objects contain will be
  // rendered in the draw function
  var TIMELINE_ITEMS = [];
  var NEW_ITEM = [];

  // Draw
  //
  // Used for drawing a 'frame'. All rendering stuff to the 
  // screen should be done in the draw method
  var _new_el;
  var _cursor_pos = {};
  function draw () {
    //if (IS_DRAGGING) console.log(NEW_ITEM);
    getCursorPosition();

    // Determine the difference between a 'drag' or a 'click'
    // by figuring out how much the mouse has moved since the 
    // last draw cycle
    if (MOUSEDOWN && !IS_DRAGGING) {
      if ((_cursor_pos.x-1 > CURSOR_POS.x) ||
          (_cursor_pos.x+1 < CURSOR_POS.x)) {
        IS_DRAGGING = true;
      }else{
        IS_DRAGGING = false;
      }
      _cursor_pos = CURSOR_POS;
    }

    // When the cursor is dragging
    if (!NEW_ITEM.length && 
        IS_DRAGGING && 
        MOUSEDOWN) {
      newTimelineItem();
    }

    // When the drag has ended
    if (NEW_ITEM.length && !MOUSEDOWN) {
      //console.log(_new_el)
      showEditUI(_new_el);
    }

    // Render the new timeline item
    if (NEW_ITEM.length) {
      if (!$('.scrubber-timeline-item', TIMELINE).length) {
        _new_el = templates().timeline_item;
        TIMELINE.append(_new_el);
        _new_el.css('margin-left', NEW_ITEM[0].start+'px');
        _new_el.addClass('new');
      }
      if (IS_DRAGGING) {
        _new_el.css('width', (CURSOR_POS.x - NEW_ITEM[0].start)+'px');
      }
    }else{
      $('.scrubber-timeline-item', TIMELINE).remove();
      $('.scrubber-edit-dialog', TIMELINE).remove();
    }

    // Render the timeline items
    TIMELINE_ITEMS.forEach(function () {

    });

    requestAnimationFrame(draw)
  }


  // New timeline item
  //
  // For pushing a new timeline item into the NEW_ITEM array
  // at the current cursor position
  function newTimelineItem () {
    var item = {
      start: CURSOR_POS.x
    };
    NEW_ITEM.push(item);
  }


  // Get cursor position
  //
  // For getting the current cursor position relative to the 
  // TIMELINE dom element, and writing it to CURSOR_POS variable
  function getCursorPosition () {
    var _el_offset = TIMELINE.offset();
    TIMELINE.on('mousemove', function (e) {
      var x = (e.pageX - _el_offset.left);
      var y = (e.pageY - _el_offset.top);
      CURSOR_POS = { x: x, y: y };
    });
  }


  // Get context length
  //
  // Used for getting the context length in seconds from the 
  // data-scrubber-length attribute
  function getContextLength () {
    CONTEXT_LENGTH = EL.data('length');
  }


  // Templates povider
  //
  // A provider that returns jQuery elements for use as templates.
  // See return value for available templates 
  //
  // @returns {Object}
  function templates () {
    var timeline_item = function () {
      return $('<div class="scrubber-timeline-item"></div>');
    }

    var edit_bubble = function () {
      var lines = [];
      lines.push('<div class="scrubber-edit-dialog">');
      lines.push('<h2>New segment</h2>');
      lines.push('<div class="scrubber-form-row"><input type="url" placeholder="http://"></div>');
      lines.push('<div class="scrubber-form-row"><input type="text" placeholder="label"></div>');
      lines.push('<div class="scrubber-button-group"><button class="cancel half" data-scrubber-action="cancel"></button><button class="half create" data-scrubber-action="create"></button></div>');
      lines.push('</div>');
      return $(lines.join(''));
    }

    var timeline = function () {
      return $('<div class="scrubber-timeline"></div>')
    }

    return {
      timeline_item: timeline_item(),
      edit_bubble: edit_bubble(),
      timeline: timeline()
    }
  }

  // Show edit UI
  //
  // Bring up the edit dialog box
  //
  // @param element {DOMObject} the timeline element to append to
  function showEditUI (element) {
    if (!$('.scrubber-edit-dialog', TIMELINE).length) {
      $(element).append( templates().edit_bubble );
    }
  }

  // Bootstrap
  //
  // Initialise all the things, and attach global events, and start
  // the draw process
  function bootstrap () {
    getContextLength();
    
    TIMELINE.on('mousedown', function () {
      MOUSEDOWN = true;
    });

    TIMELINE.on('mouseup', function (e) {
      if (IS_DRAGGING) {
        IS_DRAGGING = false;
        MOUSEDOWN = false;
      }
    });

    requestAnimationFrame(draw)
  }

  bootstrap();

})(jQuery);