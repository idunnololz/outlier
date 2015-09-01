requirejs(['./config'], function (config) {
requirejs(['jquery', 'React', 'libs/autosuggest.min', 'app/buildlist', 'app/search'], function ($, React, Autosuggest, BuildListLib) {
    var BuildList = BuildListLib.BuildList;
    var Build = BuildListLib.Build;
    var QueryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
            // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        } 
        return query_string;
    }();
    
    var core = [];
    var champLib = [];

    var ProfileDiv = React.createClass({displayName: "ProfileDiv",
        render: function() {
            var division;
            if (this.props.data.division != undefined) {
                division = (
                    React.createElement("h3", null, this.props.data.division.toUpperCase())
                );
            }
            return (
                React.createElement("div", {className: "profile-div themed-light"}, 
                    React.createElement("img", {className: "summoner-profile-img", src: this.props.data.summonerProfileSrc}), 
                    React.createElement("div", null, 
                        React.createElement("h1", null, this.props.data.summonerName), 
                        division
                    )
                )
            );
        }
    });

    var UserView = React.createClass({displayName: "UserView",
        getInitialState: function() {
            return {
                data: {
                    summonerName: QueryString.search,
                    builds: []
                },
                loaded: false
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON(this.props.url, function(json) {
                    core.data = json;
                }),

                $.getJSON("/res/summoner.json", function(summoners) {
                    core.summoners = summoners;
                }),

                $.getJSON("/res/item.json", function(items) {
                    core.items = items;
                })
            ).then(function() {
                // do a bit of preprocessing

                $.each(core.data.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners.data[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners.data[val.summonerSpells[1]];
                });

                this.setState({data: core.data, loaded: true});
            }.bind(this));
        },
        render: function() {
            var buildlist;
            if (this.state.loaded) {
                buildlist = (React.createElement(BuildList, {data: this.state.data.builds, core: core}));
            }
            return (
                React.createElement("div", null, 
                    React.createElement(ProfileDiv, {data: this.state.data}), 
                    buildlist
                )
            );
        }
    });

    var url = "";
    if (QueryString.search === "idunnololz") {
        url = "builds.json";
    }
    React.render(
      React.createElement(UserView, {url: url}),
      $("#main-content")[0]
    );

});
});