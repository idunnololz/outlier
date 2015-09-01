define(['jquery', 'React'], function ($, React) {
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

    function getRoleName(role, lane) {
        if (role === "SOLO" && lane === "MIDDLE") {
            return "Solo mid";
        } else if (role === "DUO_CARRY" && lane === "MIDDLE") {
            return "Duo mid";
        } else if (role === "DUO_SUPPORT") {
            return "Support";
        }
        
        return role + " " + lane;
    }

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    const SHOW_MAIN = 1;
    const SHOW_RUNES_MASTERIES = 2;
    var BuildList = React.createClass({
        getInitialState() {
            return {
                champLib: [],
                buildView: [],
                animate: false,
                changed: -1
            };
        },
        loadDataForBuilds(builds) {
            var champLib = this.state.champLib;
            var champLibProp = this.props.champLib;

            var changed = false;
            var buildView = this.state.buildView;
            this.props.data.map(function (build, i) {
                if (buildView[i] === undefined) {
                    buildView[i] = SHOW_MAIN;
                    changed = true;
                }
            });
            if (changed) {
                this.setState({'buildView': buildView, changed: -1});
            }

            builds.map(function (build, i) {
                var champion = build.champion;
                if (champLib[champion] === undefined) {
                    if (champLibProp[champion] !== undefined) {
                        champLib[champion] = champLibProp[champion];
                        this.setState({changed: -1});
                    } else {
                        $.getJSON("/res/champion/" + champion + ".json", function(json) {
                            champLib[champion] = json.data[champion];
                            this.setState({'champLib': champLib, changed: -1});
                        }.bind(this));
                    }
                }
            }.bind(this));
        },
        componentDidMount() {
            this.loadDataForBuilds(this.props.data);
        },
        componentWillReceiveProps(nextProps) {
            this.loadDataForBuilds(nextProps.data);
        },
        onSwitchView(index) {
            var buildView = this.state.buildView;
            if (buildView[index] === SHOW_MAIN) {
                buildView[index] = SHOW_RUNES_MASTERIES;
            } else if (buildView[index] === SHOW_RUNES_MASTERIES) {
                buildView[index] = SHOW_MAIN;
            }

            this.setState({'buildView': buildView, animate: true, changed: index});
        },
        render() {
            var champLib = this.state.champLib;
            var buildView = this.state.buildView;
            var needRunesAndMasteryInfo = false;

            var buildNodes = this.props.data.map(function (build, i) {
                var swapping = this.state.changed !== -1;
                var shouldIgnore = swapping && i !== this.state.changed;

                if (buildView[i] === SHOW_MAIN) {
                    return (
                        <Build 
                            ignore={shouldIgnore}
                            build={build} 
                            key={"Build" + i} 
                            core={this.props.core} 
                            champLib={champLib} 
                            onSwitchView={this.onSwitchView.bind(this, i)}>
                        </Build>
                    );
                } else if (buildView[i] === SHOW_RUNES_MASTERIES) {
                    needRunesAndMasteryInfo = true;
                    return (
                        <RunesAndMasteries 
                            ignore={shouldIgnore}
                            build={build} 
                            key={"RunesAndMasteries" + i} 
                            core={this.props.core} 
                            champLib={champLib} 
                            onSwitchView={this.onSwitchView.bind(this, i)}>
                        </RunesAndMasteries>
                    );
                }
            }.bind(this));

            if (needRunesAndMasteryInfo && this.props.core.masteryData === undefined) {
                this.props.loader.loadRuneAndMasteryData();
            }

            return (
                <div className="build-list">
                    <ReactCSSTransitionGroup transitionName="slide" transitionLeave={false} transitionEnter={this.state.animate}>
                        {buildNodes}
                    </ReactCSSTransitionGroup>
                </div>
            );
        }
    });

    const MAX_TIME_BETWEEN_BLOCKS = 10000; // 10s

    var Build = React.createClass({
        fetchSpecialSummonerSpell(summoners) {
            if (summoners[0].id === "SummonerFlash") {
                return summoners[1].id; 
            }
            return summoners[0].id;
        },
        handleGetItemSetClick(e) {
            var $target = $(e.target);
            var build = this.props.build;
            var finalItems = [];

            if ($target.text() !== "Get ItemSet") return;

            $target.text("Generating...");

            var elemToItemSetItem = (elem) => {
                return {
                    id: elem.itemId.toString(),
                    count: 1
                };
            };

            setTimeout(() => {
                var itemBuild = build.itemEvents;

                console.log(itemBuild);
                itemBuild = itemBuild.filter((elem) => {
                    return (elem.itemId !== "2010");
                });

                var items = $.map(itemBuild, function(elem, index) {
                    var itemSetItem = elemToItemSetItem(elem);

                    if (elem.is_final_item) {
                        finalItems.push(itemSetItem);
                    }
                    return itemSetItem;
                });

                var blocks = [];

                var lastItems = [];
                var itemSetItems = [];
                for (var i = 0; i < itemBuild.length; i++) {
                    var elem = itemBuild[i];
                    var firstItem = lastItems.length === 0;
                    if (!firstItem) {
                        var lastTime = lastItems[lastItems.length - 1].timestamp;
                        if (elem.timestamp - lastTime > MAX_TIME_BETWEEN_BLOCKS) {
                            var sectionName = blocks.length === 0 ? "First build this" : "Then build this";
                            blocks.push({
                                type: sectionName,
                                'items': itemSetItems
                            });

                            lastItems = [];
                            itemSetItems = [];
                        }
                    }

                    lastItems.push(elem);
                    itemSetItems.push(elemToItemSetItem(elem));
                }
                blocks.push({
                    type: "Finally build this",
                    'items': itemSetItems
                });

                blocks.push({
                    type: "Complete build order",
                    'items': items
                });

                blocks.push({
                    type: "Full build",
                    'items': finalItems
                });

                var name = build.champion + "-" + build.role + "-" + build.lane;

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
                    $target.text("Get ItemSet");
                    var blob = new Blob([JSON.stringify(itemSet)], {type: "application/json;charset=utf-8"});
                    saveAs(blob, name + ".json");
                }.bind(this));
            }, 1);

            console.log(build);

        },
        useDefaultTooltip(component) {
            if (component == undefined) return;
            var $elem = $(component.getDOMNode());
            var title = $elem.attr('title');
            $elem.removeAttr('title');
            $elem.mouseover(() => {
                tooltip.pop($elem[0], title);
            });
            $elem.click(() => {
                tooltip.pop($elem[0], title);
            });
        },
        shouldComponentUpdate(nextProps, nextState) {
            return !nextProps.ignore;
        },
        switchView(event) {
            var $toAnimate = $(React.findDOMNode(this.refs.root));
            $toAnimate.on("transitionend", (e) => {
                $toAnimate.off(e);
                this.props.onSwitchView();
            });
            $toAnimate.addClass("dismiss");
        },
        render() {
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
                var finalBuild = [];

                $.each(itemBuildRaw, (index, item) => {
                    console.log(item.itemId);
                    if (item.is_final_item) {
                        finalBuild.push(
                            <img
                                className={item.is_final_item ? "primary-item" : "item"}
                                src={"/res/item/" + core.items.data[item.itemId].image.full}
                                key={index}
                                title={core.items.data[item.itemId].name}
                                ref={this.useDefaultTooltip}/>
                        );
                    }

                    itemBuild.push(
                        <img
                            className={item.is_final_item ? "primary-item" : "item"}
                            src={"/res/item/" + core.items.data[item.itemId].image.full}
                            key={index}
                            title={core.items.data[item.itemId].name}
                            ref={this.useDefaultTooltip}/>
                    );

                    if (length - 1 != index) {
                        itemBuild.push(<div className="bridge" key={index+"bridge"}></div>);
                    }
                });
            }

            if (build.skillups != undefined && champData != undefined) {
                var skillArr = makeArray(18, 5, 0);

                $.each(build.skillups, function(index, val) {
                    skillArr[val+1][index] = 1;
                });

                var skillLetter = "QWER";

                function generateRowForPassive(arr) {
                    var row = [];
                    row.push(<td key="generateRowForPassive-1" className="td-center nb-top-right-left"><img className="spell-icon" src={"/res/passive/" + champData.passive.image.full}/></td>);
                    row.push(<td key="generateRowForPassive-3" className="spell-name-col nb-top-left"><h1>{champData.passive.name.toLowerCase()}</h1></td>);
                    $.each(arr, (index, val) => {
                        var c = "nb-top";
                        if (index + 1 == arr.length) {
                            c = "nb-top-right";
                        }
                        row.push(<td key={"generateRowForPassive-" + (index + 10)} className={c + " skill-slot"}/>);
                    });
                    return row;
                }

                function generateRowForSpell(index, arr) {
                    var borderClass1 = "nb-top-right-left";
                    var borderClass2 = "nb-top-left";
                    var borderClass3 = "";
                    var borderClass4 = "nb-right";
                    if (index === 3) {
                        borderClass1 = "nb";
                        borderClass2 = "nb-top-bottom-left";
                        borderClass3 = "nb-bottom";
                        borderClass4 = "nb-bottom-right";
                    }
                    var row = [];
                    row.push(
                        <td key="generateRowForSpell-1" className={"td-center " + borderClass1}>
                            <span className="spell-icon-key">
                                <img className="spell-icon" src={"/res/spell/" + champData.spells[index].image.full}/>
                                <h2>{skillLetter.charAt(index)}</h2>
                            </span>
                        </td>);
                    row.push(<td key="generateRowForSpell-3" className={borderClass2}><h1>{champData.spells[index].name.toLowerCase()}</h1></td>);
                    $.each(arr, (index, val) => {
                        var cellContent = val === 0 ? [] : (
                            // if this cell should be a skill up
                            <div className="level">{index + 1}</div>
                        );
                        var c = borderClass3;
                        if (index + 1 === arr.length) {
                            c = borderClass4;
                        }
                        row.push(
                            <td key={"generateRowForSpell-" + (index + 10)} className={"skill-slot " + c}>
                                {cellContent}
                            </td>);
                    });
                    return row;
                }

                skillOrder = (
                    <div className="skill-order-table-container">
                        <table className="skill-order">
                            <tr> {generateRowForPassive(skillArr[0])} </tr>
                            <tr> {generateRowForSpell(0, skillArr[1])} </tr>
                            <tr> {generateRowForSpell(1, skillArr[2])} </tr>
                            <tr> {generateRowForSpell(2, skillArr[3])} </tr>
                            <tr> {generateRowForSpell(3, skillArr[4])} </tr>
                        </table>
                    </div>
                );
            }

            var roleName = getRoleName(this.props.build.role, this.props.build.lane);

            return (
                <div className="build themed-light" ref="root">
                    <div className="show-runes-masteries-container">
                        <div className="button-show-runes-masteries" onClick={this.switchView}>Runes & Masteries &gt;</div>
                        <div className="fold"></div>
                    </div>
                    <div className="build-top">
                        <div className="build-left-col">
                            <div ref={this.useDefaultTooltip} title={build.champion} className="champion-profile-img" 
                            style={{"backgroundImage": "url(/res/autocomplete_mock/" + build.champion + ".png)"}}/>
                            <img ref={this.useDefaultTooltip} className="summoner-spell-1-img" title={build.summonerSpells[0].name} src={"/res/spell/" + build.summonerSpells[0].image.full}/>
                            <img ref={this.useDefaultTooltip} className="summoner-spell-2-img" title={build.summonerSpells[1].name} src={"/res/spell/" + build.summonerSpells[1].image.full}/>
                        </div>
                        <div className="build-right-col">
                            <table className="flex-align-top">
                                <tr>
                                    <td><h4>role</h4></td>
                                    <td><h3>{roleName}</h3></td>
                                </tr>
                                <tr>
                                    <td><h4>win rate</h4></td>
                                    <td><h3>{(build.stats.wins/(build.stats.wins + build.stats.losses) * 100).toFixed(2) + "%" + "(" + build.stats.count + ")"}</h3></td>
                                </tr>
                                <tr>
                                    <td><h4>final build</h4></td>
                                </tr>
                            </table>
                            <div className="final-build">
                                {finalBuild}
                            </div>
                        </div>
                    </div>
                    <h4>item build</h4>
                    <div className="item-build">
                        {itemBuild}
                    </div>
                    <h4>skill order</h4>
                    <div className="build-bottom">
                        {skillOrder}
                    </div>
                    <a onClick={this.handleGetItemSetClick}>Get ItemSet</a>
                </div>
            );
        }
    });

    var RunesAndMasteries = React.createClass({
        useDefaultTooltip(component) {
            if (component == undefined) return;
            var $elem = $(component.getDOMNode());
            var title = $elem.attr('title');
            $elem.removeAttr('title');
            $elem.mouseover(() => {
                tooltip.pop($elem[0], title);
            });
            $elem.click(() => {
                tooltip.pop($elem[0], title);
            });
        },
        switchView(event) {
            var $toAnimate = $(React.findDOMNode(this.refs.root));
            $toAnimate.on("transitionend", (e) => {
                $toAnimate.off(e);
                this.props.onSwitchView();
            });
            $toAnimate.addClass("dismiss");
        },
        shouldComponentUpdate(nextProps, nextState) {
            return !nextProps.ignore;
        },
        setupMastery(masteryId, component) {
            if (component === null) return;
            var $elem = $(component.getDOMNode());
            var mastery = this.props.core.masteryData.data[masteryId];

            var doPopup = () => {
                var text = "<h1>" + mastery.name + "</h1><p>" +
                    mastery.description[0] + "</p>"; 
                tooltip.pop($elem[0], text);
            };

            $elem.mouseover(doPopup);
            $elem.click(doPopup);
        },
        render() {
            var build = this.props.build;
            var masteries = build.masteries;
            var masteryData = this.props.core.masteryData;
            var runeData = this.props.core.runeData;

            var masteryView = [];
            if (masteryData != undefined) {
                var masteryTaken = {};
                $.each(masteries, (index, val) => {
                    masteryTaken[val.masteryId] = val.rank;
                });

                var masteryDic = masteryData.data;
                var generateViewFor = (treeName, data) => {
                    var t = data;
                    var rowView = t.map((val, index) => {
                        var cellView = val.map((val, index) => {
                            if (val === null) {
                                return (<div className="mastery-cell"> </div>);
                            }

                            var ranks = masteryTaken[val.masteryId];
                            if (ranks === undefined) {
                                ranks = 0;
                            }

                            var imageInfo = masteryDic[val.masteryId].image;
                            var maxRanks = masteryDic[val.masteryId].ranks;
                            var complete = maxRanks === ranks;

                            var bg = ranks === 0 ?
                                "url(/res/gray_" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat" :
                                "url(/res/" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat";

                            return ranks === 0 ? (
                                <div ref={this.setupMastery.bind(this, val.masteryId)} className="mastery-cell" style={{width: imageInfo.w, height: imageInfo.h, 
                                    background: bg}}>
                                </div>
                            ) : (
                                <span ref={this.setupMastery.bind(this, val.masteryId)}>
                                    <div className={complete ? "mastery-cell-complete" : "mastery-cell-some"} 
                                        style={{width: imageInfo.w, height: imageInfo.h, background: bg}}>
                                    </div>
                                    <div className={complete ? "mastery-rank-complete" : "mastery-rank-some"}>
                                        {ranks + "/" + maxRanks}
                                    </div>
                                </span>
                            );
                        });

                        return (
                            <div className="mastery-row">
                                {cellView}
                            </div>
                        );
                    });

                    return (
                        <div className="mastery-section">
                            {rowView}
                        </div>
                    );
                };
                masteryView = $.map(masteryData.tree, (val, key) => {
                    return generateViewFor(key, val);
                });
            }

            var runeView = [];
            if (runeData !== undefined) {
                runeData = runeData.data;
                runeView = build.runes.map((val, index) => {
                    var count = val.rank;
                    var rune = runeData[val.runeId];
                    var imageInfo = rune.image;

                    var bg = "url(/res/" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat";

                    return (
                        <div className="runeItem">
                            <div style={{width: imageInfo.w, height: imageInfo.h, background: bg}}> </div>
                            <p><span className="runeName">{count + "x " + rune.name}</span><span className="runeDesc">{rune.description}</span></p>
                        </div>
                    );
                });
            }


            return (
                <div className="runes-masteries themed-light" ref="root">
                    <div className="show-runes-masteries-container">
                        <div className="button-show-runes-masteries" onClick={this.switchView}>Build &gt;</div>
                        <div className="fold"></div>
                    </div>
                    <h1>runes & masteries</h1>
                    <div className="masteries">
                        {masteryView}
                    </div>
                    <div className="runes">
                        {runeView}
                    </div>
                </div>
            );
        }
    });

    return {
        'BuildList': BuildList,
        'Build': Build,
        'RunesAndMasteries': RunesAndMasteries
    }
});