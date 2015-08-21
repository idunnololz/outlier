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
            
    var core = [];

    var Expandable = React.createClass({displayName: "Expandable",
        getInitialState: function() {
            return {
                maxHeight: 0
            };
        },
        componentDidUpdate: function(prevProps) {
            if (prevProps.expanded !== this.props.expanded) {
                this.setMaxHeight();
            }
        },
        setMaxHeight: function() {
            var bodyNode = React.findDOMNode(this.refs.content);
            // var images = bodyNode.querySelectorAll('img');

            // if (images.length > 0) {
            //     return this.preloadImages(bodyNode, images);
            // }

            this.setState({
                maxHeight: this.props.expanded ? bodyNode.scrollHeight + 'px' : '0px',
            });
        },
        render: function() {
            return (
                React.createElement("div", {className: "content", style: {maxHeight: this.state.maxHeight, transition: 'max-height .3s ease', overflow: 'hidden'}, ref: "content"}, 
                    React.createElement("div", {className: "test"}, " ")
                )
            );
        }
    });

    var ChampionDiv = React.createClass({displayName: "ChampionDiv",
        getInitialState: function() {
            return {
                expanded: false
            };
        },
        handleClick: function() {
            this.setState({
                expanded: !this.state.expanded
            });
        },
        render: function() {
            if (this.props.data != undefined) {
                var champion = this.props.data;
                return (
                    React.createElement("div", null, 
                        React.createElement("div", {className: "outer-div"}, 
                            React.createElement("img", {className: "champion-splash", src: "/res/champion/splash/" + champion.id + "_0.jpg"}), 
                            React.createElement("div", {className: "champion-div"}, 
                                React.createElement("img", {className: "champion-thumb", src: "/res/autocomplete_mock/" + champion.image.full}), 
                                React.createElement("div", null, 
                                    React.createElement("h1", null, champion.name.toLowerCase()), 
                                    React.createElement("h2", null, champion.title)
                                )
                            )
                        ), 

                        React.createElement("div", {className: "drop-down"}, 
                            React.createElement(Expandable, {expanded: this.state.expanded}), 
                            React.createElement("div", {className: "expand-collapse", style: {backgroundImage: "url(/res/expand.png)", 
                                 transform: this.state.expanded ? "rotate(180deg)" : "rotate(0deg)"}, 
                                 onClick: this.handleClick}, " ")
                        )
                    )
                );
            } else {
                return (
                    React.createElement("div", {className: "champion-div themed-light"}
                    )
                );
            }
        }
    });

    var ChampionView = React.createClass({displayName: "ChampionView",
        getInitialState: function() {
            return {
                data: {
                    builds: [],
                },
                loaded: false
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON(this.props.url, function(json) {
                    core.builds = json;
                }),

                $.getJSON("/res/champion/" + QueryString.id + ".json", function(champion) {
                    core.champion = champion.data[QueryString.id];
                }),
                
                $.getJSON("/res/summoner.json", function(summoners) {
                    core.summoners = summoners;
                }),

                $.getJSON("/res/item.json", function(items) {
                    core.items = items;
                }),

                $.getScript("/buildlist.js")
            ).then(function() {
                $.each(core.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners.data[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners.data[val.summonerSpells[1]];
                });
                this.setState({data: core, loaded: true});
            }.bind(this));
        },
        render: function() {
            var buildlist;
            if (this.state.loaded) {
                buildlist = (React.createElement(BuildList, {data: this.state.data.builds, core: core, champLib: core.champion}));
            }
            return (
                React.createElement("div", null, 
                    React.createElement(ChampionDiv, {data: this.state.data.champion}), 
                    buildlist
                )
            );
        }
    });
    React.render(
      React.createElement(ChampionView, {url: "mock/" + QueryString.id + ".json"}),
      $("#main-content")[0]
    );

});