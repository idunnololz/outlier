requirejs(['./config'], function (config) {
requirejs(['jquery', 'React', 'autosuggest.min', 'app/buildlist'], function ($, React, Autosuggest, BuildListLib) {
    var BuildList = BuildListLib.BuildList;
    var Build = BuildListLib.Build;
    requirejs(['app/search']);
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
            var commonBuild = this.props.commonBuild;
            var build;
            if (commonBuild !== undefined) {
                commonBuild = commonBuild.value;
                if (typeof(Build) != "undefined") {
                    build = (
                        React.createElement("div", null, 
                            React.createElement("h5", null, "Common build"), 
                            React.createElement(Build, {build: commonBuild, core: core, champLib: this.props.champLib})
                        ));
                }
            }
            // <CommonBuild build={commonBuild}/>
            return (
                React.createElement("div", {className: "content", style: {maxHeight: this.state.maxHeight, transition: 'max-height .3s ease', overflow: 'hidden'}, ref: "content"}, 
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
                React.createElement("div", null, 
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
                        React.createElement(Expandable, {expanded: this.state.expanded, commonBuild: this.props.commonBuild, champLib: this.props.champLib}), 
                        React.createElement("div", {className: "expand-collapse", style: {backgroundImage: "url(/res/expand.png)", 
                             transform: this.state.expanded ? "rotate(180deg)" : "rotate(0deg)"}, 
                             onClick: this.handleClick}, " ")
                    )
                )
            );
        }
    });

    var ChampionView = React.createClass({displayName: "ChampionView",
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
                        cache: true,
                        success: function(data) {
                            core.builds = data.data;
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error(this.props.url, status, err.toString());
                        }.bind(this)
                    })
                );
            }.bind(this)).then(function() {
                $.each(core.builds, function(index, val) {
                    val.value.summonerSpells[0] = core.summoners[val.value.summonerSpells[0]];
                    val.value.summonerSpells[1] = core.summoners[val.value.summonerSpells[1]];
                    val.value.champion = this.props.id;
                }.bind(this));
                this.setState({data: core, loaded: true});
                return $.ajax({
                        type: 'get',
                        url: this.props.commonUrl + core.champion.key,
                        dataType: 'json',
                        cache: true,
                        success: function(common) {
                            core.common = common.data;
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error(this.props.url, status, err.toString());
                        }.bind(this)
                });
                // $.getJSON(this.props.commonUrl, function(common) {
                //     core.common = common;
                // });
            }.bind(this)).then(function() {
                val = core.common;
                val.value.summonerSpells[0] = core.summoners[val.value.summonerSpells[0]];
                val.value.summonerSpells[1] = core.summoners[val.value.summonerSpells[1]];
                val.value.champion = this.props.id;
                this.setState({commonBuild: core.common});
            }.bind(this));
        },
        render: function() {
            var buildlist;
            var champLib = {};
            champLib[this.props.id] = core.champion;
            if (this.state.loaded && core.builds != undefined) {
                buildlist = (React.createElement(BuildList, {data: this.state.data.builds, core: core, champLib: champLib}));
            }
            return (
                React.createElement("div", null, 
                    React.createElement(ChampionDiv, {data: this.state.data.champion, commonBuild: this.state.commonBuild, champLib: champLib}), 
                    buildlist
                )
            );
        }
    });

    React.render(
        React.createElement(ChampionView, {
            url: "http://ec2-54-148-42-154.us-west-2.compute.amazonaws.com:5000/api/champion/outlier/", //{"mock/" + QueryString.id + ".json"} 
            commonUrl: "http://ec2-54-148-42-154.us-west-2.compute.amazonaws.com:5000/api/champion/common/", 
            id: QueryString.id, 
            championName: ""}),
        $("#main-content")[0]
    );
});
});