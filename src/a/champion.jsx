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

    var CommonBuild = React.createClass({
        render: function() {
            var build = this.props.build;
            var itemBuild = [];
            var skillOrder = [];
            var champData = core.champion;
            if (build == undefined) {
                return (<div/>);
            }
            var itemBuildRaw = build.itemEvents;
            if (itemBuildRaw != undefined) {
                var length = itemBuildRaw.length;
                var itemBuild = [];
                $.each(itemBuildRaw, function(index, item) {
                    itemBuild.push(
                            <img
                                className={item.is_final_item ? "primary-item" : "item"}
                                src={"/res/item/" + core.items.data[item.itemId].image.full}
                                key={index}/>
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
                    <div><h5>Common build</h5></div>
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

    var Expandable = React.createClass({
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
                <div className="content" style={{maxHeight: this.state.maxHeight, transition: 'max-height .3s ease', overflow: 'hidden'}} ref="content"> 
                    <CommonBuild build={commonBuild}/>
                </div>
            );
        }
    });

    var ChampionDiv = React.createClass({
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
                <div>
                    <div className="outer-div">
                        <img className="champion-splash" src={"/res/champion/splash/" + champion.id + "_0.jpg"}/>
                        <div className="champion-div">
                            <div className="champion-thumb" style={{"backgroundImage": "url(/res/autocomplete_mock/" + champion.id + ".png)"}}/>
                            <div>
                                <h1>{champion.name.toLowerCase()}</h1>
                                <h2>{champion.title}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="drop-down">
                        <Expandable expanded={this.state.expanded} commonBuild={this.props.commonBuild}/>
                        <div className="expand-collapse" style={{backgroundImage: "url(/res/expand.png)", 
                             transform: this.state.expanded ? "rotate(180deg)" : "rotate(0deg)"}}
                             onClick={this.handleClick}> </div>
                    </div>
                </div>
            );
        }
    });

    var ChampionView = React.createClass({
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
                buildlist = (<BuildList data={this.state.data.builds} core={core} champLib={champLib}/>);
            }
            return (
                <div>
                    <ChampionDiv data={this.state.data.champion} commonBuild={this.state.commonBuild}/>
                    {buildlist}
                </div>
            );
        }
    });

    React.render(
        <ChampionView 
            url={"http://ec2-54-148-42-154.us-west-2.compute.amazonaws.com:5000/api/champion/outlier/"}//{"mock/" + QueryString.id + ".json"} 
            commonUrl={"http://ec2-54-148-42-154.us-west-2.compute.amazonaws.com:5000/api/champion/common/"} 
            id={QueryString.id} 
            championName=""/>,
        $("#main-content")[0]
    );

});