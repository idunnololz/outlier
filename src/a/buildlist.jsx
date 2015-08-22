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

var BuildList = React.createClass({
    getInitialState: function() {
        return {
            champLib: []
        };
    },
    loadDataForBuilds: function(builds) {
        var champLib = this.state.champLib;
        var champLibProp = this.props.champLib;
        builds.map(function (build, i) {
            var champion = build.value.champion;
            if (champLib[champion] == undefined) {
                if (champLibProp[champion] !== undefined) {
                    champLib[champion] = champLibProp[champion];
                    this.setState({});
                } else {
                    $.getJSON("/res/champion/" + champion + ".json", function(json) {
                        champLib[champion] = json.data[champion];
                        this.setState({'champLib': champLib});
                    }.bind(this));
                }
            }
        }.bind(this));
    },
    componentDidMount: function() {
        this.loadDataForBuilds(this.props.data);
    },
    componentWillReceiveProps: function(nextProps) {
        this.loadDataForBuilds(nextProps.data);
    },
    render: function() {
        var champLib = this.state.champLib;
        var buildNodes = this.props.data.map(function (build, i) {
            return (
                <Build build={build.value} key={i} core={this.props.core} champLib={champLib}>
                </Build>
            );
        }.bind(this));
        return (
            <div className="build-list">
                {buildNodes}
            </div>
        );
    }
});

var Build = React.createClass({
    fetchSpecialSummonerSpell: function(summoners) {
        if (summoners[0].id === "SummonerFlash") {
            return summoners[1].id; 
        }
        return summoners[0].id;
    },
    handleGetItemSetClick: function() {
        var build = this.props.build;

        var items = $.map(build.itemEvents, function(elem, index) {
            return {
                id: elem.itemId.toString(),
                count: 1
            };
        });

        var blocks = [{
            type: "Primary build",
            showIfSummonerSpell: this.fetchSpecialSummonerSpell(build.summonerSpells),
            'items': items
        }];

        var name = build.champion + "-" + build.role;

        var itemSet = {
            title: name,
            type: "custom",
            map: "SR",
            mode: "any",
            'blocks': blocks
        };

        $.when(
            $.getScript("/libs/Blob.min.js"),
            $.getScript("/libs/FileSaver.min.js")
        ).then(function() {
            var blob = new Blob([JSON.stringify(itemSet)], {type: "application/json;charset=utf-8"});
            saveAs(blob, name + ".json");
        }.bind(this));

    },
    render: function() {
        var champLib = this.props.champLib;
        var core = this.props.core;
        var build = this.props.build;
        var itemBuild = [];
        var skillOrder = [];
        var champData = champLib[build.champion];
        var itemBuildRaw = build.itemEvents;
        if (itemBuildRaw != undefined) {
            var length = itemBuildRaw.length;
            var itemBuild = [];
            $.each(itemBuildRaw, function(index, item) {
                itemBuild.push(
                    <img
                        className={item.is_final_item ? "primary-item" : "item"}
                        src={"/res/item/" + core.items.data[item.itemId].image.full}
                        key={index}
                        title={core.items.data[item.itemId].name}/>
                );

                if (length - 1 != index) {
                    itemBuild.push(<div className="bridge" key={index+"bridge"}></div>);
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
                row.push(<td key="generateRowForLevels-1"/>);
                row.push(<td key="generateRowForLevels-2"/>);
                row.push(<td key="generateRowForLevels-3"/>);
                for (var i = 0; i < 18; i++) {
                    row.push(<td key={"generateRowForLevels-" + (i + 10)}><h3>{i+1}</h3></td>);
                }
                return row;
            }

            function generateRowForPassive(arr) {
                var row = [];
                row.push(<td key="generateRowForPassive-1" className="td-center"><img className="spell-icon" src={"/res/passive/" + champData.passive.image.full}/></td>);
                row.push(<td key="generateRowForPassive-2"/>);
                row.push(<td key="generateRowForPassive-3"><h1>{champData.passive.name.toLowerCase()}</h1></td>);
                $.each(arr, function(index, val) {
                    row.push(<td key={"generateRowForPassive-" + (index + 10)}/>);
                });
                return row;
            }

            function generateRowForSpell(index, arr) {
                var row = [];
                row.push(<td key="generateRowForSpell-1" className="td-center"><img className="spell-icon" src={"/res/spell/" + champData.spells[index].image.full}/></td>);
                row.push(<td key="generateRowForSpell-2"><h2>{skillLetter.charAt(index)}</h2></td>);
                row.push(<td key="generateRowForSpell-3"><h1>{champData.spells[index].name.toLowerCase()}</h1></td>);
                $.each(arr, function(index, val) {
                    row.push(<td key={"generateRowForSpell-" + (index + 10)} className="border-cell"><span className={val == 0 ? "unchecked" : "checked"}/></td>);
                });
                return row;
            }

            skillOrder = (
                <div className="skill-order-table-container">
                    <table className="skill-order">
                        <tr> {generateRowForLevels()} </tr>
                        <tr> {generateRowForPassive(skillArr[0])} </tr>
                        <tr> {generateRowForSpell(0, skillArr[1])} </tr>
                        <tr> {generateRowForSpell(1, skillArr[2])} </tr>
                        <tr> {generateRowForSpell(2, skillArr[3])} </tr>
                        <tr> {generateRowForSpell(3, skillArr[4])} </tr>
                    </table>
                </div>
            );
        }

        return (
            <div className="build themed-light">
                <div className="build-top">
                    <div className="build-left-col">
                        <img className="champion-profile-img" title={build.champion} src={"/res/autocomplete_mock/" + build.champion + ".png"}/>
                        <img className="summoner-spell-1-img" title={build.summonerSpells[0].name} src={"/res/spell/" + build.summonerSpells[0].image.full}/>
                        <img className="summoner-spell-2-img" title={build.summonerSpells[1].name} src={"/res/spell/" + build.summonerSpells[1].image.full}/>
                    </div>
                    <div className="build-right-col">
                        <table className="flex-align-top">
                            <tr>
                                <td><h4>role</h4></td>
                                <td><h3>{this.props.build.role}</h3></td>
                            </tr>
                            <tr>
                                <td><h4>win rate</h4></td>
                                <td><h3>{(build.winRate * 100).toFixed(2) + "%" + "(" + build.stats.count + ")"}</h3></td>
                            </tr>
                            <tr>
                                <td><h4>build</h4></td>
                            </tr>
                        </table>
                        <div className="item-build">
                            {itemBuild}
                        </div>
                    </div>
                </div>
                <div className="build-bottom">
                    {skillOrder}
                </div>
                <a onClick={this.handleGetItemSetClick}>Get ItemSet</a>
            </div>
        );
    }
});