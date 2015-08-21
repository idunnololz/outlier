function makeArray(w, h, val) {
    var arr = [];
    for(i = 0; i < h; i++) {
        arr[i] = [];
        for(j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}

var BuildList = React.createClass({displayName: "BuildList",
    getInitialState: function() {
        return {
            champLib: []
        };
    },
    loadDataForBuilds: function(builds) {
        var champLib = this.state.champLib;
        builds.map(function (build, i) {
            var champion = build.champion;
            if (champLib[champion] == undefined) {
                $.getJSON("/res/champion/" + champion + ".json", function(json) {
                    champLib[champion] = json.data[champion];
                    this.setState({'champLib': champLib});
                }.bind(this));
            }
        }.bind(this));
    },
    componentDidMount: function() {
        if (this.props.champLib != undefined) {
            this.setState({champLib: this.props.champLib});
        }
        this.loadDataForBuilds(this.props.data);
    },
    componentWillReceiveProps: function(nextProps) {
        this.loadDataForBuilds(nextProps.data);
    },
    render: function() {
        var champLib = this.state.champLib;
        var buildNodes = this.props.data.map(function (build, i) {
            return (
                React.createElement(Build, {build: build, key: i, core: this.props.core, champLib: champLib}
                )
            );
        }.bind(this));
        return (
            React.createElement("div", {className: "build-list"}, 
                buildNodes
            )
        );
    }
});

var Build = React.createClass({displayName: "Build",
    handleGetItemSetClick: function() {
        
    },
    render: function() {
        var champLib = this.props.champLib;
        var core = this.props.core;
        var build = this.props.build;
        var itemBuild = [];
        var skillOrder = [];
        var champData = champLib[build.champion];
        console.log(champData);
        if (build.itemBuild != undefined) {
            var length = build.itemBuild.length;
            var itemBuild = [];
            $.each(build.itemBuild, function(index, item) {
                itemBuild.push(
                        React.createElement("img", {
                            className: item.primary ? "primary-item" : "item", 
                            src: "/res/item/" + core.items.data[item.id].image.full, 
                            key: index})
                );

                if (length - 1 != index) {
                    itemBuild.push(React.createElement("div", {className: "bridge", key: index+"bridge"}));
                }
            });
        }

        if (build.skillOrder != undefined && champData != undefined) {
            var skillArr = makeArray(18, 5, 0);

            $.each(build.skillOrder, function(index, val) {
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
                                React.createElement("td", null, React.createElement("h3", null, this.props.build.winrate + "%"))
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