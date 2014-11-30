;(function ($) {
  'use strict';

  // Scrubber and timeline elements
  var EL = $('*[data-scrubber]');
  var TIMELINE = templates().timeline;
  EL.append( TIMELINE );

  // State variables
  var MOUSEDOWN = false;
  var IS_DRAGGING = false;
  var IS_FOCUSED = false;
  var CONTEXT_LENGTH;
  var CURSOR_POS;
  var CURSOR_TIME;

  // Any data that the timeline objects contain will be
  // rendered in the draw function
  var TIMELINE_ITEMS = [];
  var LIVE_ITEM = [];

  // Create time marker elements
  var TIME_MARKERS = templates().time_markers;
  EL.append( TIME_MARKERS );


  // Draw
  //
  // Used for drawing a 'frame'. All rendering stuff to the 
  // screen should be done in the draw method
  var _new_el;
  var _cursor_pos = {};
  function draw () {

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
    if (!LIVE_ITEM.length && 
        IS_DRAGGING && 
        MOUSEDOWN) {
      newTimelineItem();
    }

    // Render the new timeline item - this is the item that is 
    // currently being created or edited
    if (LIVE_ITEM.length) {
      if (!$('.scrubber-timeline-item', TIMELINE).length) {
        _new_el = templates().timeline_item;
        TIMELINE.append(_new_el);
        _new_el.addClass('new');
      }
      if (IS_DRAGGING) {
        LIVE_ITEM[0].end = ((CURSOR_POS.x - LIVE_ITEM[0].start) > 0) ? (CURSOR_POS.x - LIVE_ITEM[0].start) : 1;
      }
      if (!MOUSEDOWN) {
        showEditUI(_new_el);
      }
      _new_el.css('margin-left', LIVE_ITEM[0].start+'px');
      _new_el.css('width', LIVE_ITEM[0].end+'px');
    }else{
      $('.scrubber-timeline-item.new', TIMELINE).remove();
      $('.scrubber-edit-dialog', TIMELINE).remove();
    }

    // Render the timeline items
    TIMELINE_ITEMS.forEach(function () {

    });

    // Update the time markers
    updateCursorTime();
    if (CURSOR_TIME) {
      $('.scrubber-time-cursor .scrubber-time-label', TIME_MARKERS).text(CURSOR_TIME.hh+':'+CURSOR_TIME.mm+':'+CURSOR_TIME.ss);
      $('.scrubber-time-cursor', TIME_MARKERS).css('left', (CURSOR_TIME.width_ratio*100)+'%');
    }

    requestAnimationFrame(draw)
  }


  // New timeline item
  //
  // For pushing a new timeline item into the LIVE_ITEM array
  // starting at the current cursor position
  function newTimelineItem () {
    var item = {
      start: CURSOR_POS.x
    };
    LIVE_ITEM.push(item);
  }


  // Get cursor position
  //
  // For getting the current cursor position relative to the 
  // TIMELINE dom element, and writing it to CURSOR_POS variable
  function getCursorPosition () {
    CURSOR_POS = CURSOR_POS || {x:0, y:0};
    var _el_offset = TIMELINE.offset();
    TIMELINE.on('mousemove', function (e) {
      var x = (e.pageX - _el_offset.left);
      var y = (e.pageY - _el_offset.top);
      CURSOR_POS = { x: x, y: y };
    });
  }


  // Update cursor time
  //
  // For calculating time and updating the CURSOR_TIME variable
  function updateCursorTime () {
    var _length = CONTEXT_LENGTH;
    var _cursor = CURSOR_POS;
    var _timeline_width = TIMELINE.outerWidth();
    var _width_ratio = (_cursor.x / _timeline_width);
    var _time_ratio =  _width_ratio * _length;
    var _time = secondsToHHMMSS(_time_ratio);
    if (_time) {
      CURSOR_TIME = _time;
      CURSOR_TIME.width_ratio = _width_ratio;
    }
  }


  // Get context length
  //
  // Used for getting the context length in seconds from the 
  // data-scrubber-length attribute
  function getContextLength () {
    CONTEXT_LENGTH = EL.data('scrubber-length');
  }


  // Show edit UI
  //
  // Bring up the edit dialog box
  //
  // @param element {DOMObject} the timeline element to append to
  function showEditUI (element) {
    if (!$('.scrubber-edit-dialog', TIMELINE).length) {
      var edit_ui = templates().edit_bubble;
      $(element).append( edit_ui );
    }
  }


  // Seconds -> HHMMSS
  //
  // Converts boring old seconds to object containing 
  // HH MM SS as strings
  //
  // @returns {Object} keys: hh, mm, ss
  function secondsToHHMMSS (secs) {
    if (typeof secs !== 'number' && 
        typeof secs !== 'string') {
      return null;
    }
    var _seconds = parseInt(secs, 10);
    var hours = Math.floor(_seconds/3600);
    var minutes = Math.floor((_seconds - (hours*3600)) / 60);;
    var seconds = _seconds - (hours * 3600) - (minutes * 60);
    return {
      hh: (hours < 10) ? '0'+hours : hours.toString(),
      mm: (minutes < 10) ? '0'+minutes : minutes.toString(),
      ss: (seconds < 10) ? '0'+seconds : seconds.toString()
    }
  }


  // Set time markers
  //
  // Populate the times markers based on the CONTEXT_LENGTH variable
  function setTimeMarkers () {
    var _running_time = secondsToHHMMSS(CONTEXT_LENGTH);
    if (_running_time) {
      var el_start = $('.scrubber-time-start');
      var el_end = $('.scrubber-time-end');
      $('.scrubber-time-label', el_start).text('00:00:00');
      $('.scrubber-time-label', el_end).text(_running_time.hh+':'+_running_time.mm+':'+_running_time.ss);
    }
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

    var time_markers = function () {
      var lines = [];
      lines.push('<div class="scrubber-times-container">');
      lines.push('<div class="scrubber-time-start"><span class="scrubber-time-label"></span></div>');
      lines.push('<div class="scrubber-time-cursor hide"><span class="scrubber-time-label"></span></div>');
      lines.push('<div class="scrubber-time-end"><span class="scrubber-time-label"></span></div>');
      lines.push('</div>');
      return $(lines.join(''));
    }

    return {
      timeline_item: timeline_item(),
      edit_bubble: edit_bubble(),
      timeline: timeline(),
      time_markers: time_markers()
    }
  }


  // Bootstrap
  //
  // Initialise all the things, and attach global events, and start
  // the draw process
  function bootstrap () {
    getContextLength();
    getCursorPosition()
    setTimeMarkers();
    
    TIMELINE.on('mouseenter', function (e) {
        IS_FOCUSED = true;
    });

    TIMELINE.on('mouseleave', function () {
      IS_FOCUSED = false;
    });

    TIMELINE.on('mousedown', function (e) {
      if ($(e.target).is('.scrubber-timeline, .scrubber-timeline-item')) {
        MOUSEDOWN = true;
      }else{
        MOUSEDOWN = false;
      }
    });

    TIMELINE.on('mouseup', function (e) {
      if (IS_DRAGGING) {
        IS_DRAGGING = false;
      }
      MOUSEDOWN = false;
    });

    requestAnimationFrame(draw)
  }

  bootstrap();

})(jQuery);