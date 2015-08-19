$(function() {
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
        $formSearch[0].submit();
    });

    $formSearch.submit(function (e) {
        if (e.preventDefault) e.preventDefault();

        /* do what you want with the form */
        console.log("submit!");

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
            <div className="suggestion-item">
                <img className="suggestion-circle-mask" src={"/res/autocomplete_mock/" + suggestion.image}></img>
                <span className="suggestion-text">{suggestion.champion}</span>
            </div>
        );
    }

    function getSuggestionValue(suggestion) {
        return suggestion.champion;
    }

    const inputAttributes = {
        id: 'search-bar-input',
        name: 'search',
        placeholder: 'Summoner name/champion'
    };

    React.render(
        <Autosuggest suggestions={getSuggestions}
                     suggestionRenderer={renderSuggestion}
                     inputAttributes={inputAttributes}
                     suggestionValue={getSuggestionValue}
                     scrollBar={true}/>,
        $("#search-bar-placeholder")[0]
    );

});