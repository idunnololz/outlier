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

    var CommonBuild = React.createClass({displayName: "CommonBuild",
        render: function() {
            var build = this.props.build;
            var itemBuild = [];
            var skillOrder = [];
            var champData = core.champion;
            if (build == undefined) {
                return (React.createElement("div", null));
            }
            var itemBuildRaw = build.itemEvents;
            if (itemBuildRaw != undefined) {
                var length = itemBuildRaw.length;
                var itemBuild = [];
                $.each(itemBuildRaw, function(index, item) {
                    itemBuild.push(
                            React.createElement("img", {
                                className: item.is_final_item ? "primary-item" : "item", 
                                src: "/res/item/" + core.items.data[item.itemId].image.full, 
                                key: index})
                    );

                    if (length - 1 != index) {
                        itemBuild.push(React.createElement("div", {className: "bridge", key: index+"bridge"}));
                    }
                });
            }

            if (build.skillUps != undefined && champData != undefined) {
                var skillArr = makeArray(18, 5, 0);

                $.each(build.skillUps, function(index, val) {
                    skillArr[val+1][index] = 1;
                });

                var skillLetter = "QWER";

                function generateRowForLevels() {
                    var row = [];
                    row.push(React.createElement("td", {key: "generateRowForLevels-1"}));
                    row.push(React.createElement("td", {key: "generateRowForLevels-2"}));
                    row.push(React.createElement("td", {key: "generateRowForLevels-3"}));
                    for (var i = 0; i < 18; i++) {
                        row.push(React.createElement("td", {key: "generateRowForLevels-" + (i + 10)}, React.createElement("h3", null, i+1)));
                    }
                    return row;
                }

                function generateRowForPassive(arr) {
                    var row = [];
                    row.push(React.createElement("td", {key: "generateRowForPassive-1", className: "td-center"}, React.createElement("img", {className: "spell-icon", src: "/res/passive/" + champData.passive.image.full})));
                    row.push(React.createElement("td", {key: "generateRowForPassive-2"}));
                    row.push(React.createElement("td", {key: "generateRowForPassive-3"}, React.createElement("h1", null, champData.passive.name.toLowerCase())));
                    $.each(arr, function(index, val) {
                        row.push(React.createElement("td", {key: "generateRowForPassive-" + (index + 10)}));
                    });
                    return row;
                }

                function generateRowForSpell(index, arr) {
                    var row = [];
                    row.push(React.createElement("td", {key: "generateRowForSpell-1", className: "td-center"}, React.createElement("img", {className: "spell-icon", src: "/res/spell/" + champData.spells[index].image.full})));
                    row.push(React.createElement("td", {key: "generateRowForSpell-2"}, React.createElement("h2", null, skillLetter.charAt(index))));
                    row.push(React.createElement("td", {key: "generateRowForSpell-3"}, React.createElement("h1", null, champData.spells[index].name.toLowerCase())));
                    $.each(arr, function(index, val) {
                        row.push(React.createElement("td", {key: "generateRowForSpell-" + (index + 10), className: "border-cell"}, React.createElement("span", {className: val == 0 ? "unchecked" : "checked"})));
                    });
                    return row;
                }

                skillOrder = (
                    React.createElement("div", {className: "skill-order-table-container"}, 
                        React.createElement("table", {className: "skill-order"}, 
                            React.createElement("tr", null, " ", generateRowForLevels(), " "), 
                            React.createElement("tr", null, " ", generateRowForPassive(skillArr[0]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(0, skillArr[1]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(1, skillArr[2]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(2, skillArr[3]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(3, skillArr[4]), " ")
                        )
                    )
                );
            }

            return (
                React.createElement("div", {className: "build themed-light"}, 
                    React.createElement("div", null, React.createElement("h5", null, "Common build")), 
                    React.createElement("div", {className: "build-top"}, 
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
                                React.createElement("td", null, React.createElement("h3", null, (build.winRate * 100).toFixed(2) + "%" + "(" + build.stats.count + ")"))
                                ), 
                                React.createElement("tr", null, 
                                    React.createElement("td", null, React.createElement("h4", null, "build"))
                                )
                            ), 
                            React.createElement("div", {className: "item-build"}, 
                                itemBuild
                            )
                        )
                    ), 
                    React.createElement("div", {className: "build-bottom"}, 
                        skillOrder
                    ), 
                    React.createElement("a", {onClick: this.handleGetItemSetClick}, "Get ItemSet")
                )
            );
        }
    });

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
            if (commonBuild !== undefined) {
                commonBuild = commonBuild.value;
            }
            return (
                React.createElement("div", {className: "content", style: {maxHeight: this.state.maxHeight, transition: 'max-height .3s ease', overflow: 'hidden'}, ref: "content"}, 
                    React.createElement(CommonBuild, {build: commonBuild})
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
                        React.createElement(Expandable, {expanded: this.state.expanded, commonBuild: this.props.commonBuild}), 
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

                    $.getScript("/buildlist.min.js"),

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
            if (this.state.loaded && core.builds != undefined) {
                var champLib = {};
                champLib[this.props.id] = core.champion;
                buildlist = (React.createElement(BuildList, {data: this.state.data.builds, core: core, champLib: champLib}));
            }
            return (
                React.createElement("div", null, 
                    React.createElement(ChampionDiv, {data: this.state.data.champion, commonBuild: this.state.commonBuild}), 
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