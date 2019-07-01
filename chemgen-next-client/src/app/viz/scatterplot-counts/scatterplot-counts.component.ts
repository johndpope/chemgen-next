import {Component, OnInit} from '@angular/core';
import {ExpSetSearchResults, ExpSetSearch, ExpsetModule} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {ModelPredictedCountsResultSet} from "../../../types/sdk/models";
import {get, minBy, maxBy} from 'lodash';
import * as Highcharts from 'highcharts';

@Component({
    templateUrl: './scatterplot-counts.component.html',
    styleUrls: ['./scatterplot-counts.component.css']
})
export class ScatterplotCountsComponent implements OnInit {

    Highcharts = Highcharts;

    expSets: ExpSetSearchResults = null;
    expSetModule: ExpsetModule;
    expSet: any;
    expSetsByTreatmentId: any = {};
    errorMessage: any = null;
    counts: any = {treat_rnai: [], ctrl_rnai: [], ctrl_null: [], ctrl_strain: []};
    minEgg: number;
    maxEgg: number;
    minLarva: number;
    maxLarva: number;
    minWorm: number;
    maxWorm: number;

    // chart: any;
    // chart: Chart;
    reagentChart: Object;
    ctrlChart: Object;

    constructor(private expSetApi: ExpSetApi) {
    }

    ngOnInit() {
        this.expSetApi.getExpSetsByWorkflowId(new ExpSetSearch({ctrlLimit: 1000}))
            .subscribe((results) => {
                this.expSets = results.results;
                this.expSetModule = new ExpsetModule(this.expSets);
                this.parseExpSets();
            }, (error) => {
                this.errorMessage = error;
            });
    }

    parseExpSets() {
        this.minWorm = minBy(this.expSetModule.expSets.modelPredictedCounts, 'wormCount')['wormCount'];
        this.maxWorm = minBy(this.expSetModule.expSets.modelPredictedCounts, 'wormCount')['wormCount'];

        this.minLarva = minBy(this.expSetModule.expSets.modelPredictedCounts, 'larvaCount')['larvaCount'];
        this.maxLarva = minBy(this.expSetModule.expSets.modelPredictedCounts, 'larvaCount')['larvaCount'];

        this.minEgg = minBy(this.expSetModule.expSets.modelPredictedCounts, 'eggCount')['eggCount'];
        this.maxEgg = minBy(this.expSetModule.expSets.modelPredictedCounts, 'eggCount')['eggCount'];

        this.expSetModule.expSets.modelPredictedCounts.map((count: ModelPredictedCountsResultSet) => {
            if (count.expGroupId) {
                let expAssay2reagents = this.expSetModule.findExpAssay2reagents(count.expGroupId);
                let countArray = {
                    treatmentGroupId: count.treatmentGroupId,
                    selected: false,
                    x: count.eggCount, y: count.larvaCount, z: count.wormCount,
                };
                if (!get(this.counts, expAssay2reagents[0].reagentType)) {
                    this.counts[expAssay2reagents[0].reagentType] = [];
                }

                this.counts[expAssay2reagents[0].reagentType].push(countArray);
                this.expSet = this.expSetModule.getExpSet(count);
                if(!get(this.expSetsByTreatmentId, count.treatmentGroupId)){
                    this.expSetsByTreatmentId[count.treatmentGroupId] = this.expSetModule.getExpSet(count);
                }
            }
        });
        this.initChart();
    }


    initChart() {
        this.ctrlChart = {
            chart: {
                type: 'scatter3d',
                options3d: {
                    enabled: true,
                    alpha: 20,
                    beta: 30,
                    depth: 200,
                    viewDistance: 10,
                    frame: {
                        bottom: {
                            size: 1,
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            },
            title: {
                text: 'Ctrl Null and Ctrl Strain (L4440 N2 and L4440 mel-28)'
            },
            subtitle: {
                text: ''
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                }
            },
            xAxis: {
                //@ts-ignore
                min: this.eggMin,
                //@ts-ignore
                max: this.eggMax,
            },
            yAxis: {
                //@ts-ignore
                min: this.larvaMin,
                //@ts-ignore
                max: this.larvaMax,
            },
            //@ts-ignore
            zAxis: {
                //@ts-ignore
                min: this.wormMin,
                //@ts-ignore
                max: this.wormMax,
            },
            series: [
                {
                    name: 'ctrl_null',
                    color: 'gray',
                    data: this.counts.ctrl_null,
                },
                {
                    name: 'ctrl_strain',
                    color: 'black',
                    data: this.counts.ctrl_strain,
                },
            ]
        };

        this.reagentChart = {
            chart: {
                type: 'scatter3d',
                options3d: {
                    enabled: true,
                    alpha: 20,
                    beta: 30,
                    depth: 500,
                    viewDistance: 10,
                    frame: {
                        bottom: {
                            size: 1,
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                },
                events: {
                    selection: function (e) {
                        console.log('in selection....');
                        this.selectPointsByDrag(e);
                        return false;
                    }.bind(this),
                    click: function (e) {
                        this.unselectByClick(e);
                    }.bind(this),
                    selectedpoints: function(e){
                        this.selectedPoints(e);
                    }.bind(this),
                },
                zoomType: 'xy'
            },
            title: {
                text: 'Reagents in mel-28 and N2'
            },
            subtitle: {
                text: ''
            },
            plotOptions: {
                series: {
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: 'Egg: {point.x}, Larva: {point.y}, Worm: {point.z}'
                    },
                    point: {
                        events: {
                            click: function (e) {
                                const p = e.point;
                                p.color = 'green';
                                // alert(`Series: ${p.series.name} Egg: ${p.x} Larva: ${p.y} Worm: ${p.z}`);
                                this.expSet = this.expSetsByTreatmentId[p.treatmentGroupId];
                            }.bind(this),
                        }
                    }
                },
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x} cm, {point.y} kg'
                    }
                }
            },
            xAxis: {
                //@ts-ignore
                min: this.eggMin,
                //@ts-ignore
                max: this.eggMax,
                title: 'Egg Count',
            },
            yAxis: {
                //@ts-ignore
                min: this.larvaMin,
                //@ts-ignore
                max: this.larvaMax,
                title: 'Larva Count',
            },
            //@ts-ignore
            zAxis: {
                //@ts-ignore
                min: this.wormMin,
                //@ts-ignore
                max: this.wormMax,
                title: 'Worm Count'
            },
            series: [
                {
                    name: 'treat_rnai',
                    color: 'blue',
                    data: this.counts.treat_rnai,
                },
                {
                    name: 'ctrl_rnai',
                    color: 'red',
                    data: this.counts.ctrl_rnai,
                },
            ]
        };
    }

    selectedPoints(e){
        console.log('in selected points!');
    }
    unselectByClick(e) {
        console.log(' in unselect by click...');
        // var points = this.getSelectedPoints();
        // if (points.length > 0) {
        //     Highcharts.each(points, function (point) {
        //         point.select(false);
        //     });
        // }
    }

    selectPointsByDrag(e) {

        console.log(e.yAxis[0].min, e.yAxis[0].max);
        console.log(e.xAxis[0].min, e.xAxis[0].max);
        // From here we can get all the points!
        return false; // Don't zoom
    }
}

