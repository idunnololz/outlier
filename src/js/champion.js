requirejs(['jquery', 'React', 'libs/autosuggest.min', 'app/buildlist', 'app/search'], function ($, React, Autosuggest, BuildListLib) {
    var BuildList = BuildListLib.BuildList;
    var Build = BuildListLib.Build;
    var RunesAndMasteries = BuildListLib.RunesAndMasteries;
    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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

    const SHOW_MAIN = 1;
    const SHOW_RUNES_MASTERIES = 2;
    var Expandable = React.createClass({displayName: "Expandable",
        getInitialState: function() {
            return {
                maxHeight: 0,
                opacity: 0,
                viewType: SHOW_MAIN
            };
        },
        componentDidUpdate: function(prevProps) {
                this.setMaxHeight();
        },
        setMaxHeight: function() {
            var bodyNode = React.findDOMNode(this.refs.content);
            // var images = bodyNode.querySelectorAll('img');

            // if (images.length > 0) {
            //     return this.preloadImages(bodyNode, images);
            // }

            var h = this.props.expanded ? bodyNode.scrollHeight + 'px' : '0px';

            if (h !== this.state.maxHeight) {
                this.setState({
                    maxHeight: h,
                    opacity: this.props.expanded ? 1 : 0
                });
            }
        },
        onSwitchView:function() {
            var viewType = this.state.viewType;
            if (viewType === SHOW_MAIN) {
                viewType = SHOW_RUNES_MASTERIES;
            } else if (viewType === SHOW_RUNES_MASTERIES) {
                viewType = SHOW_MAIN;
            }

            this.setState({'viewType': viewType});
        },
        render: function() {
            var commonBuild = this.props.commonBuild;
            var build;
            if (commonBuild !== undefined) {
                if (typeof(Build) != "undefined") {
                    if (this.state.viewType === SHOW_MAIN) {
                        build = (
                            React.createElement("div", {className: "common-build"}, 
                                React.createElement("h5", null, "Common build"), 
                                React.createElement(ReactCSSTransitionGroup, {transitionName: "slide"}, 
                                    React.createElement(Build, {
                                        build: commonBuild, 
                                        core: core, 
                                        champLib: this.props.champLib, 
                                        onSwitchView: this.onSwitchView.bind(this)})
                                )
                            ));
                    } else {
                        if (core.masteryData === undefined) {
                            this.props.loader.loadRuneAndMasteryData();
                        }
                        build = (
                            React.createElement("div", {className: "common-build"}, 
                                React.createElement("h5", null, "Common build"), 
                                React.createElement(ReactCSSTransitionGroup, {transitionName: "slide"}, 
                                    React.createElement(RunesAndMasteries, {
                                        build: commonBuild, 
                                        core: core, 
                                        champLib: this.props.champLib, 
                                        onSwitchView: this.onSwitchView.bind(this)})
                                )
                            ));
                    }
                }
            }
            // <CommonBuild build={commonBuild}/>
            return (
                React.createElement("div", {className: "content expandable", style: {maxHeight: this.state.maxHeight, opacity: this.state.opacity}, ref: "content"}, 
                    build
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
            var champion = this.props.data;
            //champion.image.full}/>
            return (
                React.createElement("div", {className: "card"}, 
                    React.createElement("div", {className: "outer-div"}, 
                        React.createElement("img", {className: "champion-splash", src: "/res/champion/splash/" + champion.id + "_0.jpg"}), 
                        React.createElement("div", {className: "champion-div"}, 
                            React.createElement("div", {className: "champion-thumb", style: {"backgroundImage": "url(/res/autocomplete_mock/" + champion.id + ".png)"}}), 
                            React.createElement("div", null, 
                                React.createElement("h1", null, champion.name.toLowerCase()), 
                                React.createElement("h2", null, champion.title)
                            )
                        )
                    ), 

                    React.createElement("div", {className: "drop-down"}, 
                        React.createElement(Expandable, {
                            expanded: this.state.expanded, 
                            commonBuild: this.props.commonBuild, 
                            champLib: this.props.champLib, 
                            loader: this.props.loader}), 
                        React.createElement("div", {className: "expand-collapse", style: {backgroundImage: "url(/res/expand.png)", 
                             transform: this.state.expanded ? "rotate(180deg)" : "rotate(0deg)"}, 
                             onClick: this.handleClick}, " ")
                    )
                )
            );
        }
    });

    var ChampionView = React.createClass({displayName: "ChampionView",
        loadRuneAndMasteryData:function() {
            $.when(
                $.getJSON("/res/mastery.json", function(masteryData) {
                    core.masteryData = masteryData;
                }),
                $.getJSON("/res/rune.json", function(json) {
                    core.runeData = json;
                })
            ).then(function()  {
                this.setState({data: core});
            }.bind(this))
        },
        getInitialState: function() {
            return {
                data: {
                    builds: [],
                    champion: {
                        name: this.props.championName,
                        id: this.props.id,
                        image: []
                    }
                },
                loaded: false,
                commonBuild: undefined
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON("/res/champion/" + QueryString.id + ".json", function(champion) {
                    core.champion = champion.data[QueryString.id];
                })

            ).then(function() {
                this.setState({data: core, loaded: true});

                return $.when(
                    $.getJSON("/res/item.json", function(items) {
                        core.items = items;
                    }),

                    $.getJSON("/res/summoner.json", function(summoners) {
                        var sumsById = [];
                        $.each(summoners.data, function(key, obj) {
                            sumsById[obj.key] = obj;
                        });
                        core.summoners = sumsById;
                    }.bind(this)),

                    $.ajax({
                        type: 'get',
                        url: this.props.url + core.champion.key,
                        dataType: 'json',
                        cache: false,
                        success: function(data) {
                            core.builds = data.data.value;
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error(this.url, status, err.toString());
                        }
                    })
                );
            }.bind(this)).then(function() {
                $.each(core.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners[val.summonerSpells[1]];
                    val.champion = this.props.id;
                }.bind(this));

                this.setState({data: core, loaded: true});
                return $.ajax({
                        type: 'get',
                        url: this.props.commonUrl + core.champion.key,
                        dataType: 'json',
                        cache: true,
                        success: function(common) {
                            core.common = common;
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error(this.url, status, err.toString());
                        }
                });
            }.bind(this)).then(function() {
                val = core.common;
                val.summonerSpells[0] = core.summoners[val.summonerSpells[0]];
                val.summonerSpells[1] = core.summoners[val.summonerSpells[1]];
                val.champion = this.props.id;
                this.setState({commonBuild: core.common});
            }.bind(this));
        },
        render: function() {
            var buildlist;
            var champLib = {};
            champLib[this.props.id] = core.champion;
            if (this.state.loaded && core.builds != undefined) {
                buildlist = (React.createElement(BuildList, {data: this.state.data.builds, core: core, champLib: champLib, loader: this}));
            }
            return (
                React.createElement("div", null, 
                    React.createElement(ChampionDiv, {data: this.state.data.champion, commonBuild: this.state.commonBuild, champLib: champLib, loader: this}), 
                    buildlist
                )
            );
        }
    });

    React.render(
        React.createElement(ChampionView, {
            url: "http://52.88.69.35:5000/api/champion/outlier/", //"/a/offline/champion"
            commonUrl: "http://52.88.69.35:5000/api/champion/common/", //"/a/offline/champion-common"
            id: QueryString.id, 
            championName: ""}),
        $("#main-content")[0]
    );
});