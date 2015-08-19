
$(function() {
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

    console.log(QueryString.search);
    
    var core = [];

    var ProfileDiv = React.createClass({displayName: "ProfileDiv",
        render: function() {
            var division;
            if (this.props.data.division != undefined) {
                var division = (
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

    var BuildList = React.createClass({displayName: "BuildList",
        render: function() {
            var buildNodes = this.props.data.map(function (build, i) {
                return (
                    React.createElement(Build, {build: build, key: i}
                    )
                );
            });
            return (
                React.createElement("div", {className: "commentList"}, 
                    buildNodes
                )
            );
        }
    });

    var Build = React.createClass({displayName: "Build",
        render: function() {
            var build = this.props.build;
            var itemBuild = [];
            if (build.itemBuild != undefined) {
                itemBuild = build.itemBuild.map(function (item, i) {
                    return (
                        React.createElement("img", {
                            className: item.primary ? "primary-item" : "item", 
                            src: "/res/item/" + core.items.data[item.id].image.full, 
                            key: i})
                    );
                });
            }
            return (
                React.createElement("div", {className: "build themed-light"}, 
                    React.createElement("div", {className: "build-left-col"}, 
                        React.createElement("img", {className: "champion-profile-img", title: build.champion, src: "/res/autocomplete_mock/" + build.champion + ".png"}), 
                        React.createElement("img", {className: "summoner-spell-1-img", title: build.summonerSpells[0].name, src: "/res/spell/" + build.summonerSpells[0].image.full}), 
                        React.createElement("img", {className: "summoner-spell-2-img", title: build.summonerSpells[1].name, src: "/res/spell/" + build.summonerSpells[1].image.full})
                    ), 
                    React.createElement("div", {className: "build-right-col"}, 
                        React.createElement("table", {className: "flex-align-top"}, 
                            React.createElement("tr", null, 
                                React.createElement("td", null, React.createElement("h4", null, "role")), 
                                React.createElement("td", null, React.createElement("h3", null, this.props.build.role))
                            ), 
                            React.createElement("tr", null, 
                                React.createElement("td", null, React.createElement("h4", null, "win rate")), 
                                React.createElement("td", null, React.createElement("h3", null, this.props.build.winrate + "%"))
                            ), 
                            React.createElement("tr", null, 
                                React.createElement("td", null, React.createElement("h4", null, "build"))
                            )
                        ), 
                        React.createElement("div", {className: "item-build"}, 
                            React.createElement("div", {className: "item-order-bg"}), 
                            itemBuild
                        )
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
                }
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON(this.props.url, function(json) {
                    core.data = json;
                }),

                $.getJSON("summoner.json", function(summoners) {
                    core.summoners = summoners;
                }),

                $.getJSON("item.json", function(items) {
                    core.items = items;
                })
            ).then(function() {
                // do a bit of preprocessing

                $.each(core.data.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners.data[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners.data[val.summonerSpells[1]];
                });

                this.setState({data: core.data});
            }.bind(this));
        },
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement(ProfileDiv, {data: this.state.data}), 
                    React.createElement(BuildList, {data: this.state.data.builds})
                )
            );
        }
    });

    React.render(
      React.createElement(UserView, {url: "builds.json"}),
      $("#main-content")[0]
    );

});