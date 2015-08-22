//Load common code that includes config, then load the app logic for this page.
requirejs(['./config'], function (config) {
requirejs(['jquery', 'React', 'autosuggest.min'], function ($, React, Autosuggest) {

    var isMobile = false;
    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;


    var $btnSearch = $('#search-button');
    var $formSearch = $('#search-form');
    var championData;

    if (!Array.prototype.filter) {
       Array.prototype.filter = function(fun /*, thisp*/) {
          var len = this.length;
          if (typeof fun != "function")
          throw new TypeError();
          
          var res = new Array();
          var thisp = arguments[1];
          for (var i = 0; i < len; i++) {
             if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this))
                res.push(val);
             }
          }
          return res;
       };
    }

    $btnSearch.click(function() {
        $formSearch.submit();
    });

    $formSearch.submit(function (e) {
        if (e.preventDefault) e.preventDefault();

        var data = $('#search-form :input').serializeArray();
        var term = data[0].value;

        const escapedInput = regExpEscape(term.trim());
        const lowercasedInput = term.trim().toLowerCase();

        loadData(function() {
            var found = false;
            championData.filter(function(element, index, array) {
                if (element.champion.toLowerCase() === lowercasedInput) {
                    window.location.href = '/champion/index.html?id=' + element.champion;
                    found = true;
                }
            });

            if (!found) {
                window.location.href = '/summoner/index.html?search=' + escapedInput;
            }
        });


        // You must return false to prevent the default form behavior
        return false;
    });

    function regExpEscape(s) {
        return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
        replace(/\x08/g, '\\x08');
    };

    function loadData(callback) {
        if (championData == undefined) {
            $.getJSON("res/autocomplete_mock/champion.json", function(json) {
                json.sort(function(a, b) {
                    return a.champion < b.champion
                });
                championData = json;
                callback();
            });
        } else {
            callback();
        }
    }

    function getSuggestions(input, callback) {
        const escapedInput = regExpEscape(input.trim());
        const lowercasedInput = input.trim().toLowerCase();

        loadData(function() {
            var suggestions = championData.filter(function(element, index, array) {
                return element.champion.toLowerCase().indexOf(lowercasedInput) === 0;
            });
            callback(null, suggestions);
        });
    }

    function renderSuggestion(suggestion, input) { // In this example, 'suggestion' is a string
        return (                                     // and it returns a ReactElement
            React.createElement("div", {className: "suggestion-item"}, 
                React.createElement("img", {className: "suggestion-circle-mask", src: "res/autocomplete_mock/" + suggestion.image}), 
                React.createElement("span", {className: "suggestion-text"}, suggestion.champion)
            )
        );
    }

    function getSuggestionValue(suggestion) {
        return suggestion.champion;
    }

    const inputAttributes = {
        id: 'search-bar-input',
        name: 'search',
        placeholder: 'Summoner name/champion',
    };

    React.render(
        React.createElement("div", null, 
            React.createElement(Autosuggest, {
                         suggestions: getSuggestions, 
                         suggestionRenderer: renderSuggestion, 
                         inputAttributes: inputAttributes, 
                         suggestionValue: getSuggestionValue, 
                         scrollBar: true, 
                         ref:  
                            function() {
                                if (!isMobile) {
                                    $('#search-bar-input')[0].focus();
                                } else {
                                    // TODO - On mobile devices, this will only work because scrolling is delayed
                                    // Order of events:
                                    // Focus is gained
                                    // Scroll is started
                                    // Screen is resized
                                    // The way google.com deals with it is that they make their page long enough so the scroll will work regardless...
                                    $('#search-bar-input').focus(function() {
                                        $('html, body').animate({
                                            scrollTop: ($("#search-bar").offset().top - 10)
                                        }, 'slow');
                                    });
                                }
                            }
                         }), 

            React.createElement("div", {id: "search-bar-items"}, 
                React.createElement("input", {className: "item", type: "image", src: "res/ic_search_black_24dp_1x.png", alt: "Search"})
            )
        ),
        $("#search-bar")[0]
    );

});
});