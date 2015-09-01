define(['jquery', 'React', 'libs/autosuggest.min'], function ($, React, Autosuggest) {
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

        /* do what you want with the form */
        console.log("submit!");

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
                //window.location.href = '/summoner/index.html?search=' + escapedInput;
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
            $.getJSON("/res/autocomplete_mock/champion.json", function(json) {
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
                React.createElement("img", {className: "suggestion-circle-mask", src: "/res/autocomplete_mock/" + suggestion.image}), 
                React.createElement("span", {className: "suggestion-text"}, suggestion.champion)
            )
        );
    }

    function getSuggestionValue(suggestion) {
        return suggestion.champion;
    }

    function onSuggestionSelected(suggestion, event) {
        $('#search-form :input').val(suggestion.champion);
        $formSearch.submit();
    }

    const inputAttributes = {
        id: 'search-bar-input',
        name: 'search',
        placeholder: 'Champion'
    };

    React.render(
        React.createElement("div", null, 
            React.createElement(Autosuggest, {suggestions: getSuggestions, 
                         suggestionRenderer: renderSuggestion, 
                         inputAttributes: inputAttributes, 
                         suggestionValue: getSuggestionValue, 
                         onSuggestionSelected: onSuggestionSelected, 
                         scrollBar: true}), 
            React.createElement("div", {id: "search-bar-items"}, 
                React.createElement("input", {className: "item", type: "image", src: "/res/ic_search_black_24dp_sx.png", alt: "Search"})
            )
        ),
        $("#search-bar")[0]
    );
    return undefined;
});