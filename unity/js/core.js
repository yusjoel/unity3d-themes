/* ====================================================
 * Company: Unity Technologies
 * Author:  Rickard Andersson, rickard@unity3d.com
 *
   TABLE OF CONTENTS
   1. Global variables
   2. Init vars & global events
   3. Basic events & methods
   4. UI events & methods
   5. Window resize checks
   6. Body click events
   7. Other
   8. Global functions
   9. Global plugins
 *
======================================================= */

/****************************************
  ==== 1. GLOBAL VARIABLES
****************************************/

var touchEnabled;   // Is it a touch device
var masterW;        // Content width
var duration = 300; // Default animation duration

(function ($) {
$(document).on("ready", function(){

/****************************************
  ==== 2. INIT VARS & GLOBAL EVENTS
****************************************/

  touchEnabled = (Modernizr.touch) ? true : false;
  masterW = getWidth();
  if (masterW > 766) subnavCheck();
  tertiarynavCheck();
  renderFooter();

  // Replace standard form select elements
  // Make sure webform selects are not disabled first.
  $('.webform-client-form select').removeAttr('disabled');
  $('select').not("[multiple=multiple]").fancySelect({ "includeBlank": true });

  // Sets language cookie when switching language
  $('.languages a').on("click", function(){
    var lang = $(this).attr("data-lang");
    $.cookie("lang_pref", lang, { expires: 30, path: "/", domain: "unity3d.com" });
  });

  // Toggle search
  $(".search-icon").on("click", function(){
    var $this = $(this);
    var $search = $(".search-wrapper");

    if ($search.hasClass("search-expanded")) {
      $search.removeClass("search-expanded");
      $this.removeClass("close-icon");
    }
    else {
      $search.addClass("search-expanded");
      $this.addClass("close-icon");
      $search.contents().find("input.sj-search-bar-input-common").focus();
    }
  });

  // Toggle user dropdown
  $('.user-icon').on("click", function(){
    var $wrapper = $('.user-wrapper');
    var $name = $wrapper.find(".name-placeholder");
    if ($wrapper.hasClass('user-expanded')) {
      $wrapper.removeClass('user-expanded');
    }
    else {
      $wrapper.addClass('user-expanded');
    }
  });

  // Make sure the name is written in placeholder.
  if (window.UnityUser) {
    UnityUser.ready(function () {
      $('.user-wrapper .name-placeholder').text(UnityUser.name);
    });
  }

  // Make third level nav stuck
  if($('.tertiary-nav ul').size() > 0 && masterW > 979 ){

    var $nav = $('.tertiary-nav'),
        $wrap = $('.wrap',$nav),
        offset = $nav.offset().top;

    $wrap.prepend('<h2>'+ $('.sub-nav a.active-trail').text() +'</h2>');
    $('ul',$wrap).append('<li class="top"></li>');

    $('.tertiary-nav').on('click','.top',function(){
      $('html, body').animate({ scrollTop: 0 }, 250, 'swing');
    });

    $(window).scroll(function(){
      var p = $(window).scrollTop();
      (p > offset) ? $nav.addClass('navstuck') : $nav.removeClass('navstuck');
    });

  }

  // Append a dropdown if items doesn't fit
  function subnavCheck(){

    var $wrap = $('.section-header'),
        $submenu = $('nav.sub-nav ul'),
        subWidth = $submenu.width(),
        acctualWidth = 0,
        more = false,
        dropdownHtml = '';

    $('nav.sub-nav ul li.more').remove();
    $('nav.sub-nav ul li').show();

    $.each($('li',$submenu), function(i,li){

      $this = $(this);
      acctualWidth += $this.outerWidth(true);

      // Is dropdown needed?
      if(acctualWidth + 80 > subWidth && !more){
        $this.before('<li class="more"><a href="" class="rel">'+ submore +'</a></li>');
        more = true;
      }

      // Clone and append overflowing list items to dropdown
      if(more && $('.subnav-dropdown').size() < 1){
        $wrap.append('<div class="subnav-dropdown clear"><ul></ul></div>');
      }
      if(more){
        $dropdown = $('.subnav-dropdown ul');
        $this.clone().appendTo( $dropdown );
        $this.addClass('hide');
      }

    });

    $('nav.sub-nav').on('click','.more',function(e){

      e.preventDefault();
      var $this = $(this),
          $dropdown = $('.section-header .subnav-dropdown');
          offset = $('nav.sub-nav li.more').offset().left - ($this.width() + 12);
          $dropdown.css('left',offset);

      if(!$this.hasClass('open')){
        $this.addClass('open');
        $dropdown.show();
      }
      else {
        $this.removeClass('open');
        $dropdown.hide();
      }
    });

  }

  // Create a dropdown to replace the tabs if the tabs overflow the wrapper
  function tertiarynavCheck(){
    if($('.tertiary-nav ul').size() > 0){

      var $tabs = $('.tertiary-nav ul.tabbed'),
          $dropdown = $('.tertiary-nav ul.dropdown'),
          $parent = $('.tertiary-nav .g12'),
          $wrap = $('.tertiary-nav .wrap'),
          maxWidth = $wrap.width(),
          fullWidth = 0;

      $.each($('.tertiary-nav ul.tabbed li'), function(i,li){
        fullWidth += $(this).outerWidth(true) + 1;
      });

      if(fullWidth > maxWidth && $('.dropdown-lbl',$parent).size() < 1){
        $tabs.addClass('hidden');
        var subnavLabel = ($('.sub-nav a.active-trail').size() > 1) ? $('.sub-nav a.active-trail').text() + ': ' : '';
        $wrap.prepend('<div class="dropdown-lbl toggle" data-target="tertiary-dropdown">'+ subnavLabel + $('.tertiary-nav ul.tabbed a.active-trail').text() +'</div>');
      }
      else if(fullWidth <= maxWidth) {
        $('.dropdown-lbl',$parent).remove();
        $dropdown.hide();
        $tabs.removeClass('hidden');
      }

    }
  }

  $('#newsletter-signup').on('submit',function(e){

    e.preventDefault();

    var email = $('.newsletter-signup #email'),
        label = $('.newsletter-signup #agree'),
        errors = 0,
        rege = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    // Reset errors
    errors = 0;
    email.removeClass('error');
    label.parent().removeClass('error');

    // Validation
    if(email.val() == '' || !rege.test(email.val())){
      email.addClass('error');
      email.focus();
      errors++;
    }
    if(label.is(':checked') == false){
      label.parent().addClass('error');
      errors++;
    }

    // If everything is peachy, do some ajax
    if(errors == 0){

      $('.newsletter-signup .field, .newsletter-signup .checkbox').addClass('hidden');
      $('.newsletter-signup .loading').removeClass('hide');

      var request = $.ajax({
        type: 'POST',
        url: $(this).attr('action'),
        data: {email: email.val()},
        success: function(){
          $('.newsletter-signup .loading').addClass('hide');
          $('.newsletter-signup .success').removeClass('hide');
          setTimeout(function(){
            $('.newsletter-signup .success').addClass('hide');
            $('.newsletter-signup .field, .newsletter-signup .checkbox').removeClass('hide');
          }, 10000);
        }
      });
      request.fail(function(jqXHR, textStatus){
        $('.newsletter-signup .loading').addClass('hide');
        $('.newsletter-signup .failed').removeClass('hide');
        setTimeout(function(){
          $('.newsletter-signup .failed').addClass('hide');
          $('.newsletter-signup .field, .newsletter-signup .checkbox').removeClass('hidden');
        }, 3000);
      });

    }
  });

/****************************************
  ==== 3. BASIC EVENTS/METHODS
****************************************/

  /* TOGGLE ANYTHING
   * Can be used for showing and hiding single elements and tabbed content
   * Usage:
   * - Add data-target="[ID]|[CLASS](optional)" to the element which has the toggle class
   * - Add data-ani="[fade][slide]" to change default animation (if empty, the default is show/hide)
   */
  $('#master-wrapper .toggle').on('click',function(e){
    e.preventDefault();

    $('a',$(this).parent().parent()).removeClass('selected');

    var $this = $(this),
        targets = $this.attr('data-target'),
        animation = ($this.attr('data-ani') == '' || $this.attr('data-ani') == undefined) ? 'default' : $this.attr('data-ani'),
        reverse = ($this.hasClass('clicked selected')) ? true : false;

    // Single element or multiple elements
    if(targets.indexOf('|') < 1){
      var $el = $('#' + targets);
      switch(animation){
        case 'fade':
          (reverse) ? $($el).stop(true,true).fadeOut(duration) : $($el).stop(true,true).fadeIn(duration);
          break;
        case 'slide':
          (reverse) ? $($el).stop(true,true).slideUp(duration) : $($el).stop(true,true).slideDown(duration);
          break;
        case 'default':
          (reverse) ? $($el).hide() : $($el).show();
          break;
      }
    }
    else {
      var $el = targets.split('|');
      switch(animation){
        case 'fade':
          $('.' + $el[1]).stop(true,true).fadeOut(duration);
          $('#' + $el[0]).stop(true,true).fadeIn(duration);
          break;
        case 'slide':
          $('.' + $el[1]).stop(true,true).slideUp(duration, function(){
            $('#' + $el[0]).stop(true,true).slideDown(duration);
          });
          break;
        case 'default':
          $('.' + $el[1]).hide();
          $('#' + $el[0]).show();
          break;
      }
    }
    (reverse) ? $this.removeClass('clicked selected') : $this.addClass('clicked selected');
  });

  /* TABS
   * Adds "selected" class to tab, hooks into toggle event
   * Usage:
   * Add class "toggle" to the anchor if it's inline tabbed content you want
   * Add class "nojs" to UL element if you want to disable the JS events
   */
  $('.tabs li a').on('click',function(e){

    var $parent = $(this).parent().parent(),
        $this = $(this);

    if(!$parent.hasClass('nojs')){
      e.preventDefault();
      $('a',$parent).removeClass('selected');
      $this.addClass('selected');
    }

  });

  /* FAQ
   * Toggles faq's
   * Usage:
   * <div class="faq clear">
   *   <a class="expand" href="#">QUESTION</a>
   *   <div class="info clear" style="display:none;">
   *     <p>ANSWER</p>
   *   </div>
   * </div>
   */
  $('.faq .expand').on('click',function(e){
    e.preventDefault();
    $(this).toggleClass('expanded');
    $(this).next('.info').slideToggle('fast');
  });

  /* CUSTOM SELECT
   * Used for custom dropdowns, which are not generated by fancy select
   * Usage:
   * <div class="select-box rel">
   *   <div class="trigger">LABEL</div>
   *   <ul class="options">
   *     <li>option</li>
   *     ...
   *   </ul>
   * </div>
   */

  $('.select-box .trigger').on('click',function(){
    var $options = $(this).parent().find('.options');
    $('.select-box .options').not($options).removeClass('open');
    $(this).toggleClass('open');
    $options.toggleClass('open');
  });

  $('.select-box .options').on('click','li',function(){
    var $parent = $(this).parent().parent().parent(),
        $select = $(this).parent().parent();

    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    if(!$select.hasClass('link-list')){
      $parent.find('.trigger').text($(this).text());
    }
    $('.select-box .options, .select-box .trigger').removeClass('open');
  });


  /* PLAY YOUTUBE VIDEO INLINE
   * Use custom image instead of youtubes default crappy cover
   * Usage:
   * <a href="EMBED SRC" id="[id]" class="inline-video rel">
   *   <div class="thumb rel">
   *     <div class="play"></div>
   *     <img src="THUMBNAIL" alt="" />
   *   </div>
   *   <div class="player">
   *     <iframe class="hide"></iframe>
   *   </div>
   * </a>
   */
  var currentIV;
  $('.inline-video').on('click',function(e){

    e.preventDefault();

    var $this = $(this),
        videoUrl = $this.attr('href'),
        quality = (touchEnabled && getWidth() < 768) ? '' : '&vq=hd1080',
        videoWidth = $this.outerWidth(true),
        videoHeight = Math.round(videoWidth * 0.5625);

    currentIV = '#' + $this.attr('id');
    $('.thumb',$this).css('opacity',0);
    $this.css('height',videoHeight + 'px');

    // Wait a bit before starting video
    setTimeout(function(){
      $('iframe',$this).attr('src',(videoUrl + quality)).removeClass('hide').css('height',videoHeight-1 + 'px');
    },750);

    // Force iframe to fill up
    setTimeout(function(){
      $('iframe',$this).css('height',videoHeight + 'px');
    },2150);

  });
  $(window).on('resize',function(){
    // Check show reel video
    if(!$(currentIV +' iframe').hasClass('hide')){
      var videoWidth = $(currentIV).outerWidth(true),
          videoHeight = Math.round(videoWidth * 0.5625);
      $(currentIV + ', '+ currentIV +' iframe').css('height',videoHeight + 'px');
    }
  });

  /* ANCHOR JUMP
   * Jump to specific anchor
   */
  $('body').on('click','.jump',function(){

    var id = $(this).attr('data-target'),
        anchor = $('#section-' + id).offset().top,
        gap = ($('.tertiary-nav ').size() > 0) ? 70 : 0;

    $('html,body').animate({ scrollTop: anchor - gap }, 500, 'swing');
  });


  // File input filename check
  $('.field-file input[type=file]').on('change', function(){

    var $this = $(this),
        $val = $this.val(),
        $input = $this.siblings('.file-input'),
        valArray = $val.split('\\'),
        filename = valArray[valArray.length-1];

    if(filename !== '') {
      $input.text(filename);
    }

  });



/****************************************
  ==== 4. UI EVENTS/METHODS
****************************************/

  // Enable tooltips
  enableTooltips();


/****************************************
  ==== 5. WINDOW RESIZE CHECKS
****************************************/

  $(window).on('resize',function(){

    tertiarynavCheck();
    renderFooter();

  });


/****************************************
  ==== 6. BODY CLICK
****************************************/

  // Hide elements on body click/touch
  $('html').bind('click', function(e){
    if($(e.target).closest('.user-wrapper').length == 0 && $(e.target).closest('.user-icon').length == 0){ $('.user-wrapper').removeClass('user-expanded'); }
    if($(e.target).closest('.tertiary-nav .wrap').length == 0){ $('.tertiary-nav ul.dropdown').hide(); $('.tertiary-nav .dropdown-lbl').removeClass('clicked'); }
    if($(e.target).closest('.fancy-select').length == 0){ $('.fancy-select ul, .fancy-select .trigger').removeClass('open'); }
    if($(e.target).closest('.select-box').length == 0){ $('.select-box ul, .select-box .trigger').removeClass('open'); }
    if($(e.target).closest('.sub-nav .subnav-dropdown').length == 0 && $(e.target).closest('.sub-nav .more').length == 0){ $('.section-header .subnav-dropdown').removeAttr('style'); $('.sub-nav .more').removeClass('open'); }
  });


/****************************************
  ==== 7. OTHER
****************************************/

  // iPad fix for orientation change
  if(window.addEventListener){
    window.addEventListener('orientationchange', function(){

    });
  }

});


/****************************************
  ==== 8. GLOBAL FUNCTIONS
****************************************/

  /* TOOL TIPS
   * Display a tool tip on hover
   * Vars:
   * - start offset: where should the animation start (integer)
   * - end offset: where should the animation end (integer)
   * - direction: top/bottom
   * Usage:
   * <div class="tt" data-distance="[start offset]|[end offset]|[direction]">
   *   <div class="element"></div>
   *   <div class="tip">Tooltip text</div>
   * </div>
   */
  window.enableTooltips = function() {
    if(!touchEnabled){
      $('.tt').hover(function(){
        var d = $(this).attr('data-distance').split('|');
        $('.tip', $(this)).css('top',d[0]+'px');
        (d[2] == 'top') ? $('.tip', $(this)).addClass('t') : $('.tip', $(this)).addClass('b');
        $('.tip', $(this)).addClass('tip-visible');
        $(this).find('.tip').stop(true, true).removeClass('hide').animate({ 'top': d[1], 'opacity': 1 }, 200 );
      },function(){
        var d = $(this).attr('data-distance').split('|');
        $(this).find('.tip').stop(true,false).animate({ 'top': d[0], 'opacity': 0 }, 200, function(){
          $(this).addClass('hide').css('marginLeft',0);
          $('.tip', $(this)).removeClass('tip-visible');
        });
      });
    }
  }

  // Get footer height and set height of empty footer div
  window.renderFooter = function() {
    var ftHeight = $('footer.clear').height();
    $('.fs').css('height', ftHeight);
  }

  // Get viewport height
  window.getHeight = function() { if(typeof window.innerHeight != 'undefined'){var viewportheight = window.innerHeight;} else if(typeof document.documentElement != 'undefined' && typeof document.documentElement.clientHeight != 'undefined' && document.documentElement.clientHeight != 0){var viewportheight = document.documentElement.clientHeight;} else {var viewportheight = document.getElementsByTagName('body')[0].clientHeight;} return viewportheight; }

  // Get viewport width
  window.getWidth = function() { if (typeof window.innerWidth != 'undefined'){var viewportwidth = window.innerWidth;} else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0){var viewportwidth = document.documentElement.clientWidth;} else {var viewportwidth = document.getElementsByTagName('body')[0].clientWidth;} return viewportwidth; }

  // Returns current OS
  window.getOS = function() {
    var os;
    if (navigator.appVersion.indexOf("Win") != -1) {
      os = "windows";
    }
    else if (navigator.appVersion.indexOf("Mac") != -1 && navigator.appVersion.indexOf("Mobile") < 0) {
      os = "osx";
    }
    else if (navigator.appVersion.indexOf("X11") != -1 || navigator.appVersion.indexOf("Linux") != -1) {
      os = "na";
    }
    else {
      os = "na";
    }
    return os;
  }

  /* FORM VALIDATION
   * Returns number of errors (integer)
   * Usage:
   * var errors = validateform($('FORM OBJECT'));
   */

  window.validateform = function(form) {
    var rege = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        regnum = /^\s*\d+\s*$/;

    var $fields = $('.req', form).not('select'),
        errors = 0;

    $('.req', form).removeClass('error');
    $('p.error', form).addClass('hide');

    $fields.each(function(){

      // Selects
      if($(this).parent().hasClass('fancy-select')){

        var filled = ($(this).parent().find('li.selected').size() > 0) ? true : false,
            val = (filled) ? $(this).parent().find('li.selected').attr('data-raw-value') : '';

        var visible = $(this).parent().parent().parent().css('display') == 'block';
        if($(this).parent().parent().hasClass('states-us')){
          if(val == '' && $('.country li.selected').attr('data-raw-value') == 'US'){
            $(this).addClass('error');
            $(this).parent().parent().find('.error').removeClass('hide');
            errors++;
          }
          else {
            return;
          }
        }
        else if($(this).parent().parent().hasClass('states-ca')){
          if(val == '' && $('.country li.selected').attr('data-raw-value') == 'CA'){
            $(this).addClass('error');
            $(this).parent().parent().find('.error').removeClass('hide');
            errors++;
          }
          else {
            return;
          }
        }
        else if($(this).parent().parent().hasClass('states-cn')){
          if(val == '' && $('.country li.selected').attr('data-raw-value') == 'CN'){
            $(this).addClass('error');
            $(this).parent().parent().find('.error').removeClass('hide');
            errors++;
          }
          else {
            return;
          }
        }
        else if(val == '' && visible){
          $(this).addClass('error');
          $(this).parent().parent().parent().find('.error').removeClass('hide');
          errors++;
        }
      }
      else if($(this).val() == ''){
        $(this).addClass('error');
        $(this).parent().parent().find('.error').removeClass('hide');
        errors++;
      }
      if($(this).attr('type') == 'file' && $(this).parent().parent().find('.file-input').text() == ''){
        $(this).parent().parent().find('.file-input').addClass('error');
        $(this).parent().parent().find('.error').removeClass('hide');
        errors++;
      }
      if($(this).hasClass('email') && !rege.test($(this).val())){
        $(this).addClass('error');
        $(this).parent().parent().find('.error').removeClass('hide');
        errors++;
      }
      if($(this).hasClass('required_num') && !regnum.test($(this).val())){
        $(this).addClass('error');
        $(this).parent().parent().find('.error').removeClass('hide');
        errors++;
      }
      if(!$(this).hasClass('error')) {
        $(this).addClass('ok');
      }

    });

    return errors;

  }

  window.getCountryExtras = function(val) {

    //if($('body').hasClass('context-sales')) return false;

    if(val == 'CA'){
      $('#canada_tr').show();
      $('#usa_tr, #china_tr').hide();
    }
    else if(val == 'US'){
      $('#usa_tr').show();
      $('#canada_tr, #china_tr').hide();
    }
    else if(val == 'CN'){
      $('#china_tr').show();
      $('#canada_tr, #usa_tr').hide();
    }
    else {
      $('#usa_tr, #canada_tr, #china_tr').hide();
    }

  }

/****************************************
  ==== 9. GLOBAL PLUGINS
****************************************/

  /* IMAGE PRELOADER
   * Preloads an array of images
   * Usage:
   * $.preload(imagesArr,{
   *   init: function(loaded, total) {},
   *   loaded: function(img, loaded, total) {},
   *   loaded_all: function(loaded, total) {}
   * });
   */
  window.imgList = [];
  $.extend({
    preload: function(imgArr, option){
      var setting = $.extend({ init: function(loaded, total) {},loaded: function(img, loaded, total) {},loaded_all: function(loaded, total) {} }, option); var total = imgArr.length; var loaded = 0; setting.init(0, total);
      for(var i in imgArr) { imgList.push($("<img />").attr("src", imgArr[i]).load(function(){ loaded++; setting.loaded(this, loaded, total); if(loaded == total) { setting.loaded_all(loaded, total); } })); }
    }
  });

/* FANCY SELECT
 * https://github.com/octopuscreative/FancySelect
 * Replaces form selects
 * Usage:
 * $('select').fancySelect();
 */
  (function(){

    var $;
    $ = window.jQuery || window.Zepto || window.$;

    $.fn.fancySelect = function(opts){

      var isiOS, settings;

      if(opts == null){
        opts = {};
      }

      settings = $.extend({
        forceiOS: false,
        includeBlank: false,
        optionTemplate: function(optionEl){
          return optionEl.text();
        },
        triggerTemplate: function(optionEl){
          return optionEl.text();
        }
      }, opts);

      isiOS = !!navigator.userAgent.match(/iP(hone|od|ad)/i);

      return this.each(function(){

        var copyOptionsToList, disabled, options, sel, trigger, updateTriggerText, wrapper;
        sel = $(this);

        if(sel.hasClass('fancified') || sel[0].tagName !== 'SELECT'){
          return;
        }

        var selclasses = (sel.attr('class')) ? sel.attr('class') : '';

        sel.addClass('fancified');
        sel.css({
          width: 1,
          height: 1,
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0
        });

        sel.wrap('<div class="fancy-select">');

        wrapper = sel.parent();
        if(sel.data('class')){
          wrapper.addClass(sel.data('class'));
        }

        wrapper.append('<div class="trigger '+selclasses+'">');
        if(!(isiOS && !settings.forceiOS)){
          wrapper.append('<ul class="options">');
        }

        trigger = wrapper.find('.trigger');
        options = wrapper.find('.options');
        disabled = sel.prop('disabled');

        if(disabled){
          wrapper.addClass('disabled');
        }

        updateTriggerText = function(){
          var triggerHtml;
          triggerHtml = settings.triggerTemplate(sel.find(':selected'));
          return trigger.html(triggerHtml);
        };

        trigger.on('close.fs', function(){
          trigger.removeClass('open');
          return options.removeClass('open');
        });

        trigger.on('click.fs', function(){
          var offParent, parent;
          $('.fancy-select .trigger').not(trigger).removeClass('open');
          $('.fancy-select ul').not(options).removeClass('open');
          if(!disabled){
            trigger.toggleClass('open');
            if(isiOS && !settings.forceiOS){
              if(trigger.hasClass('open')){
                return sel.focus();
              }
            }
            else {
              if(trigger.hasClass('open')){
                parent = trigger.parent();
                offParent = parent.offsetParent();
                if((parent.offset().top + parent.outerHeight() + options.outerHeight() + 20) > $(window).height() + $(window).scrollTop()){
                  options.addClass('overflowing');
                }
                else {
                  options.removeClass('overflowing');
                }
              }
              options.toggleClass('open');
              if(!isiOS){
                return sel.focus();
              }
            }
          }
        });

        sel.on('enable', function(){
          sel.prop('disabled', false);
          wrapper.removeClass('disabled');
          disabled = false;
          return copyOptionsToList();
        });

        sel.on('disable', function(){
          sel.prop('disabled', true);
          wrapper.addClass('disabled');
          return disabled = true;
        });

        sel.on('change.fs', function(e){
          if($(this).parent().parent().parent().hasClass('country')){
            getCountryExtras($(this).val());
          }
          if(e.originalEvent && e.originalEvent.isTrusted){
            return e.stopPropagation();
          }
          else {
            return updateTriggerText();
          }
        });

        sel.on('keydown', function(e){

          var hovered, newHovered, w;
          w = e.which;
          hovered = options.find('.hover');
          hovered.removeClass('hover');

          if(!options.hasClass('open')){
            if(w === 13 || w === 32 || w === 38 || w === 40){
              e.preventDefault();
              return trigger.trigger('click.fs');
            }
          }
          else {
            if(w === 38){
              e.preventDefault();
              if(hovered.length && hovered.index() > 0){
                hovered.prev().addClass('hover');
              }
              else {
                options.find('li:last-child').addClass('hover');
              }
            }
            else if(w === 40){
              e.preventDefault();
              if(hovered.length && hovered.index() < options.find('li').length - 1){
                hovered.next().addClass('hover');
              }
              else {
                options.find('li:first-child').addClass('hover');
              }
            }
            else if(w === 27){
              e.preventDefault();
              trigger.trigger('click.fs');
            }
            else if(w === 13 || w === 32){
              e.preventDefault();
              hovered.trigger('click.fs');
            }
            else if(w === 9){
              if(trigger.hasClass('open')){
                trigger.trigger('close.fs');
              }
            }
            else {
              $('li',options).removeClass('hover');
              setTimeout(function(){
                options.find('li[data-raw-value="'+ sel.find(':selected').val() +'"]').addClass('hover');
              }, 100);
            }

            setTimeout(function(){
              newHovered = options.find('.hover');
              if(newHovered.length){
                options.scrollTop(0);
                sel.val(newHovered.attr('data-raw-value')).trigger('change.fs');
                return options.scrollTop(newHovered.position().top - 12);
              }
            }, 100);

          }
        });

        options.on('click.fs', 'li', function(e){
          var clicked;
          clicked = $(this);

          sel.val(clicked.attr('data-raw-value'));

          // Hack for MWU create profile
          if($('.field-type-addressfield').size() > 0){
            sel.trigger('change');
          }

          if(!isiOS){
            sel.trigger('blur.fs').trigger('focus.fs');
          }

          options.find('.selected').removeClass('selected');
          clicked.addClass('selected');

          trigger.trigger('close.fs');
          return sel.val(clicked.attr('data-raw-value')).trigger('change.fs').trigger('blur.fs').trigger('focus.fs');
        });

        /*options.on('mouseenter.fs', 'li', function(){
          var hovered, nowHovered;
          nowHovered = $(this);
          hovered = options.find('.hover');
          hovered.removeClass('hover');
          return nowHovered.addClass('hover');
        });

        options.on('mouseleave.fs', 'li', function(){
          return options.find('.hover').removeClass('hover');
        });*/

        copyOptionsToList = function(){
          var selOpts;
          updateTriggerText();
          if(isiOS && !settings.forceiOS){
            return;
          }
          selOpts = sel.find('option');
          return sel.find('option').each(function(i, opt){
            var optHtml;
            opt = $(opt);
            if(!opt.prop('disabled') && (opt.val() || settings.includeBlank)){
              optHtml = settings.optionTemplate(opt);
              if(opt.prop('selected')){
                return options.append("<li data-raw-value=\"" + (opt.val()) + "\" class=\"selected\">" + optHtml + "</li>");
              } else {
                return options.append("<li data-raw-value=\"" + (opt.val()) + "\">" + optHtml + "</li>");
              }
            }
          });
        };

        sel.on('update.fs', function(){
          wrapper.find('.options').empty();
          return copyOptionsToList();
        });

        return copyOptionsToList();

      });
    };
  }).call(this);

  /* https://github.com/mathiasbynens/jquery-placeholder v2.0.7 by @mathias */
  ;(function(f,h,$){var a='placeholder' in h.createElement('input'),d='placeholder' in h.createElement('textarea'),i=$.fn,c=$.valHooks,k,j;if(a&&d){j=i.placeholder=function(){return this};j.input=j.textarea=true}else{j=i.placeholder=function(){var l=this;l.filter((a?'textarea':':input')+'[placeholder]').not('.placeholder').bind({'focus.placeholder':b,'blur.placeholder':e}).data('placeholder-enabled',true).trigger('blur.placeholder');return l};j.input=a;j.textarea=d;k={get:function(m){var l=$(m);return l.data('placeholder-enabled')&&l.hasClass('placeholder')?'':m.value},set:function(m,n){var l=$(m);if(!l.data('placeholder-enabled')){return m.value=n}if(n==''){m.value=n;if(m!=h.activeElement){e.call(m)}}else{if(l.hasClass('placeholder')){b.call(m,true,n)||(m.value=n)}else{m.value=n}}return l}};a||(c.input=k);d||(c.textarea=k);$(function(){$(h).delegate('form','submit.placeholder',function(){var l=$('.placeholder',this).each(b);setTimeout(function(){l.each(e)},10)})});$(f).bind('beforeunload.placeholder',function(){$('.placeholder').each(function(){this.value=''})})}function g(m){var l={},n=/^jQuery\d+$/;$.each(m.attributes,function(p,o){if(o.specified&&!n.test(o.name)){l[o.name]=o.value}});return l}function b(m,n){var l=this,o=$(l);if(l.value==o.attr('placeholder')&&o.hasClass('placeholder')){if(o.data('placeholder-password')){o=o.hide().next().show().attr('id',o.removeAttr('id').data('placeholder-id'));if(m===true){return o[0].value=n}o.focus()}else{l.value='';o.removeClass('placeholder');l==h.activeElement&&l.select()}}}function e(){var q,l=this,p=$(l),m=p,o=this.id;if(l.value==''){if(l.type=='password'){if(!p.data('placeholder-textinput')){try{q=p.clone().attr({type:'text'})}catch(n){q=$('<input>').attr($.extend(g(this),{type:'text'}))}q.removeAttr('name').data({'placeholder-password':true,'placeholder-id':o}).bind('focus.placeholder',b);p.data({'placeholder-textinput':q,'placeholder-id':o}).before(q)}p=p.removeAttr('id').hide().prev().attr('id',o).show()}p.addClass('placeholder');p[0].value=p.attr('placeholder')}else{p.removeClass('placeholder')}}}(this,document,jQuery));

/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
  if (typeof define === 'function' && define.amd && define.amd.jQuery) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function ($) {

  var pluses = /\+/g;

  function raw(s) {
    return s;
  }

  function decoded(s) {
    return decodeURIComponent(s.replace(pluses, ' '));
  }

  function converted(s) {
    if (s.indexOf('"') === 0) {
      // This is a quoted cookie as according to RFC2068, unescape
      s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    try {
      return config.json ? JSON.parse(s) : s;
    } catch(er) {}
  }

  var config = $.cookie = function (key, value, options) {

    // write
    if (value !== undefined) {
      options = $.extend({}, config.defaults, options);

      if (typeof options.expires === 'number') {
        var days = options.expires, t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      }

      value = config.json ? JSON.stringify(value) : String(value);

      return (document.cookie = [
        encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path    ? '; path=' + options.path : '',
        options.domain  ? '; domain=' + options.domain : '',
        options.secure  ? '; secure' : ''
      ].join(''));
    }

    // read
    var decode = config.raw ? raw : decoded;
    var cookies = document.cookie.split('; ');
    var result = key ? undefined : {};
    for (var i = 0, l = cookies.length; i < l; i++) {
      var parts = cookies[i].split('=');
      var name = decode(parts.shift());
      var cookie = decode(parts.join('='));

      if (key && key === name) {
        result = converted(cookie);
        break;
      }

      if (!key) {
        result[name] = converted(cookie);
      }
    }

    return result;
  };

  config.defaults = {};

  $.removeCookie = function (key, options) {
    if ($.cookie(key) !== undefined) {
      $.cookie(key, '', $.extend(options, { expires: -1 }));
      return true;
    }
    return false;
  };

}));
})(jQuery);
