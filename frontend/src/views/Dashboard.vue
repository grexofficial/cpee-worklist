<template>
  <el-row justify="center">
    <el-col style="flex-basis: auto;">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        unlink-panels
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
        :shortcuts="shortcuts"
        :default-time="defaultTime"
      />
    </el-col>
  </el-row>
  <el-row
    justify="center"
    :gutter="10"
  >
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading7"
        shadow="never"
        style="text-align: center; background-color: #df6a5b;"
      >
        <div> <fa icon="barcode" /> Samples scanned</div>
        <div class="card-text">
          {{ scannedSamples }}
        </div>
      </el-card>
    </el-col>
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading8"
        shadow="never"
        style="text-align: center; background-color: #eeb55f;"
      >
        <div> <fa icon="plus" /> Wellplates created</div>
        <div class="card-text">
          {{ createdWellplates }}
        </div>
      </el-card>
    </el-col>
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading6"
        shadow="never"
        style="text-align: center; background-color: #dbdde1;"
      >
        <div> <fa icon="check" /> Wellplates finnished</div>
        <div class="card-text">
          {{ finnishedWellplates }}
        </div>
      </el-card>
    </el-col>
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading2"
        shadow="never"
        style="text-align: center; background-color: #81be96;"
      >
        <div> <fa icon="file-export" /> Exported samples</div>
        <div class="card-text">
          {{ sumExport }}
        </div>
      </el-card>
    </el-col>
  </el-row>
  <el-row
    justify="center"
    :gutter="10"
  >
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading7 || loaders.loading8"
        shadow="never"
        style="text-align: center; background-color: #dbdde1;"
      >
        <div> Ø Samples per Wellplate</div>
        <div class="card-text">
          {{ avgSamplesPerWellplate }}
        </div>
      </el-card>
    </el-col>
    <el-col :span="4">
      <el-card
        v-loading="loaders.loading7"
        shadow="never"
        style="text-align: center; background-color: #dbdde1;"
      >
        <div>  Ø Sample rate</div>
        <div class="card-text">
          {{ avgSampleRate }}/d
        </div>
      </el-card>
    </el-col>
  </el-row>
  <el-row
    justify="center"
  >
    <el-col :span="8">
      <div style="text-align: center; visibility: hidden;">
        <el-select
          v-model="selectItems.taskNamesSelected2"
          size="small"
          style="width: auto;"
          :disabled="!!!scannedSamplesOverTime.length"
        >
          <el-option
            v-for="item in selectItems.taskNames"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <boxplot
        v-loading="loaders.loading2"
        :data="posNegPieChartData"
        :layout="plots.posNegPieChart.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading2"
      />
    </el-col>
    <el-col :span="8">
      <div style="text-align: center;">
        <el-select
          v-model="selectItems.taskNamesSelected"
          size="small"
          style="width: auto;"
          :disabled="!!!gbIDUser.length"
        >
          <el-option
            v-for="item in selectItems.taskNames"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <boxplot
        v-loading="loaders.loading"
        :data="userPieChartData"
        :layout="plots.userPieChart.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading"
      />
    </el-col>
    <el-col :span="8">
      <div style="text-align: center;">
        <el-select
          v-model="selectItems.taskNamesSelected2"
          size="small"
          style="width: auto;"
          :disabled="!!!scannedSamplesOverTime.length"
        >
          <el-option
            v-for="item in selectItems.taskNames"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <boxplot
        v-loading="loaders.loading3"
        :data="sampleOverTime"
        :layout="plots.sampleOverTime.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading3"
      />
    </el-col>
  </el-row>
  <el-row
    justify="center"
  >
    <el-col :span="8">
      <boxplot
        v-loading="loaders.loading9"
        :data="resultsScatter"
        :layout="plots.resultsOverTime.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading9"
      />
    </el-col>
    <el-col :span="8">
      <boxplot
        v-loading="loaders.loading4"
        :data="sampleBoxPlot"
        :layout="plots.sampleBoxPlot.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading4"
      />
    </el-col>
    <el-col :span="8">
      <boxplot
        v-loading="loaders.loading5"
        :data="wellplateBoxPlot"
        :layout="plots.wellPlateBoxPlot.layout"
        :options="plots.posNegPieChart.options"
        :loading="loaders.loading5"
      />
    </el-col>
  </el-row>
</template>

<script>
import { watchEffect } from 'vue';
import { errorMessage } from '../utils/notifications';
import { yaxisName } from '../utils/plot';
import LogApi from '../api/logs';
import Boxplot from '../components/Plot.vue';
import shortcuts from '../utils/dateShortcuts';

const cDate = new Date();

export default {
  name: 'Dashboard',
  components: {
    Boxplot,
  },
  data: () => ({
    curr: new Date(),
    shortcuts,
    dateRange: [
      new Date(cDate.getFullYear(), cDate.getMonth() - 2, 1),
      new Date(cDate.getFullYear(), cDate.getMonth() - 1, 0),
    ],
    defaultTime: [
      new Date(2000, 1, 1, 0, 0, 0),
      new Date(2000, 2, 1, 23, 59, 59),
    ],
    scannedSamples: '',
    loaders: {
      loading: true,
      loading2: true,
      loading3: true,
      loading4: true,
      loading5: true,
      loading6: true,
      loading7: true,
      loading8: true,
      loading9: true,
    },
    loading: true,
    scannedSamplesOverTime: [],
    resultsOverTime: [],
    rawSampleBoxPlot: [],
    rawWellPlateBoxPlot: [],
    createdWellplates: '',
    finnishedWellplates: '',
    gbPosNeg: [],
    gbIDUser: [],
    selectItems: {
      taskNames: [],
      taskNamesSelected: null,
      taskNamesSelected2: null,
    },
    plots: {
      posNegPieChart: {
        layout: {
          title: {
            text: 'Positive/Negative Samples',
          },
        },
        options: { displayModeBar: false },
      },
      userPieChart: {
        layout: {
          title: {
            text: `User proportion of task ${this?.selectItems?.taskNames[0]}`,
          },
        },
      },
      resultsOverTime: {
        layout: {
          title: {
            text: 'Positive samples over time',
          },
          yaxis: {
            tickformat: ',.2%',
            title: 'Positive samples in %',
          },
          xaxis: {
            tickangle: -45,
            /* nticks: 0, */
            /* tickmode: 'auto', */
            title: 'Date',
            tickformat: '%d.%m.%Y',
            dtick: 86400000.0,
          },
        },
      },
      sampleOverTime: {
        layout: {
          title: {
            text: 'Task: "Scanned samples" over time',
          },
          xaxis: {
            tickangle: -45,
            /* nticks: 0, */
            /* tickmode: 'auto', */
            title: 'Date',
            tickformat: '%d.%m.%Y',
            dtick: 86400000.0,

          },
          yaxis: {
            title: 'Number of scanned samples',
          },
        },
      },
      sampleBoxPlot: {
        layout: {
          title: {
            text: 'Deltatime scanned - exported sample',
          },
          yaxis: {
            title: 'Deltatime in hours',
          },
        },
      },
      wellPlateBoxPlot: {
        layout: {
          title: {
            text: 'Deltatime created - finnished wellplate',
          },
          yaxis: {
            title: 'Deltatime in hours',
          },
        },
      },
    },
  }),
  computed: {
    avgSamplesPerWellplate() {
      return Math.round(this.scannedSamples / this.createdWellplates) || null;
    },
    userPieChartData() {
      if (this.gbIDUser.length) {
        const values = [];
        const labels = [];
        this.gbIDUser.forEach(({ count, _id: user }) => {
          values.push(count);
          labels.push(user);
        });
        return [{
          type: 'pie',
          values,
          labels,
          textinfo: 'label+percent',
          textposition: 'auto',
          hoverinfo: 'skip',
          showlegend: false,
          automargin: true,
        }];
      }
      return null;
    },
    posNegPieChartData() {
      if (this.gbPosNeg.length) {
        const [a, b] = this.gbPosNeg;
        return [{
          type: 'pie',
          values: [a.count, b.count],
          labels: ['Negative', 'Positive'],
          textinfo: 'label+percent',
          textposition: 'auto',
          hoverinfo: 'skip',
          showlegend: false,
          marker: {
            colors: ['green', 'red'],
          },
          automargin: true,
        }];
      }
      return null;
    },
    resultsScatter() {
      if (this.resultsOverTime.length) {
        const x = [];
        const y = [];

        this.resultsOverTime.forEach(({ _id: id, counts }) => {
          x.push(id);
          const res = counts.find(({ result }) => result === 'P');

          if (res) {
            y.push(res.percentage);
          }
        });

        return [{
          x,
          y,
          type: 'scatter',
          marker: {
            color: 'red',
          },
        }];
      }
      return null;
    },
    sumExport() {
      if (this.gbPosNeg.length) {
        const [a, b] = this.gbPosNeg;
        return a.count + b.count;
      }
      return null;
    },
    avgSampleRate() {
      const [start, end] = this.dateRange;
      return Math.round(this.scannedSamples / this.datediff(start, end)) || null;
    },
    posNegProportion() {
      const posNegObj = { N: null, P: null };
      if (this.gbPosNeg.length) {
        const [a, b] = this.gbPosNeg;
        const sum = a.count + b.count;
        // eslint-disable-next-line no-underscore-dangle
        posNegObj[a._id] = a.count / sum;
        // eslint-disable-next-line no-underscore-dangle
        posNegObj[b._id] = b.count / sum;
        return posNegObj;
      }
      return posNegObj;
    },
    sampleOverTime() {
      const sLength = this.scannedSamplesOverTime.length;
      if (sLength) {
        const x = [];
        const y = [];
        this.scannedSamplesOverTime.forEach(({ count, _id: date }) => {
          x.push(date);
          y.push(count);
        });

        if (sLength < 4) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.plots.sampleOverTime.layout.xaxis.dtick = '';
        }
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.plots.sampleOverTime.layout.yaxis.title = this.yaxisName(
          this.selectItems.taskNamesSelected2,
        );

        return [{
          type: 'bar',
          x,
          y,
          hoverinfo: 'skip',
          text: y.map(String),
        }];
      }
      return null;
    },
    userProportion() {
      if (this.gbIDUser.length) {
        const sum = this.gbIDUser.map(({ count }) => count).reduce((prev, curr) => prev + curr);
        return this.gbIDUser.map(({ count, _id: user }) => ({ user, proportion: count / sum }));
      }
      return [];
    },
    sampleBoxPlot() {
      if (this.rawSampleBoxPlot.length) {
        return [{
          y: this.rawSampleBoxPlot,
          type: 'box',
          name: 'Set 1',
          boxmean: 'sd',
          marker: {
            color: 'rgb(214,12,140)',
          },
        }];
      }
      return null;
    },
    wellplateBoxPlot() {
      if (this.rawWellPlateBoxPlot.length) {
        return [{
          y: this.rawWellPlateBoxPlot,
          type: 'box',
          name: 'Set 2',
          boxmean: 'sd',
          marker: {
            color: 'rgb(0,128,128)',
          },
        }];
      }
      return null;
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'selectItems.taskNamesSelected': function (newVal) {
      const [start, end] = this.dateRange;
      this.plots.userPieChart.layout.title.text = `User proportion of task "${this.selectItems.taskNames.find((e) => e.id === newVal).name}"`;
      this.loaders.loading = true;
      this.getLogs({
        start, end, id: newVal, groupby: 'user',
      }).then(({ data }) => { this.gbIDUser = data; this.loaders.loading = false; });
    },
    // eslint-disable-next-line func-names
    'selectItems.taskNamesSelected2': function (newVal) {
      const [start, end] = this.dateRange;
      this.plots.sampleOverTime.layout.title.text = `Task: "${this.selectItems.taskNames.find((e) => e.id === newVal).name}" over time`;
      this.loaders.loading3 = true;
      this.getLogs({
        start, end, id: newVal, groupby: 'timestamp',
      }).then(({ data }) => { this.scannedSamplesOverTime = data; this.loaders.loading3 = false; });
    },
  },
  created() {
  /*  this.socket.on('getTasks', () => {
      this.getTask();
    }); */
  },
  mounted() {
    watchEffect(async () => {
      const start = this.dateRange[0];
      const end = this.dateRange[1];
      // parallel start of tasks
      this.loaders.loading8 = true;
      this.getLogs({ start, end, id: 1 }).then(({ count }) => {
        this.createdWellplates = count;
        this.loaders.loading8 = false;
      });
      this.loaders.loading6 = true;
      this.getLogs({
        start, end, id: 2,
      }).then(({ count }) => {
        this.finnishedWellplates = count;
        this.loaders.loading6 = false;
      });
      this.loaders.loading7 = true;
      this.getLogs({ start, end, id: 3 }).then(({ count }) => {
        this.scannedSamples = count;
        this.loaders.loading7 = false;
      });
      this.loaders.loading2 = true;
      this.getLogs({
        start, end, id: 9, groupby: 'body.result',
      }).then(({ data }) => { this.gbPosNeg = data; this.loaders.loading2 = false; });
      const groupByNames = this.getLogs({ groupby: 'name' });
      const gbNamesTemp = await groupByNames;
      this.selectItems.taskNames = gbNamesTemp.data.map(({ _id: id }) => id);
      this.selectItems.taskNamesSelected = '7';
      this.selectItems.taskNamesSelected2 = '3';
      this.plots.userPieChart.layout.title.text = `User proportion of task "${this.selectItems.taskNames[0].name}"`;
      this.loaders.loading = true;
      this.getLogs({
        start, end, id: this.selectItems.taskNamesSelected, groupby: 'user',
      }).then(({ data }) => { this.gbIDUser = data; this.loaders.loading = false; });
      // TODO: change change id?
      this.loaders.loading3 = true;
      this.getLogs({
        // eslint-disable-next-line no-underscore-dangle
        start, end, id: this.selectItems.taskNamesSelected2, groupby: 'timestamp',
      }).then(({ data }) => { this.scannedSamplesOverTime = data; this.loaders.loading3 = false; });
      this.loaders.loading4 = true;
      this.getBi({
        start, end, startTask: 3, endTask: 9, joinTask: 'sampleid', format: 'h',
      }).then((data) => {
        this.rawSampleBoxPlot = data.map((e) => e.deltaTime);
        this.loaders.loading4 = false;
      });
      this.loaders.loading5 = true;
      this.getBi({
        start, end, startTask: 1, endTask: 2, joinTask: 'plateid', format: 'h',
      }).then((data) => {
        this.rawWellPlateBoxPlot = data.map((e) => e.deltaTime);
        this.loaders.loading5 = false;
      });
      this.loaders.loading9 = true;
      this.getLogs({
        start, end, id: 9, groupby: ['timestamp', 'body.result'],
      }).then(({ data }) => { this.resultsOverTime = data; this.loaders.loading9 = false; });
    });
  },
  methods: {
    yaxisName,
    datediff(start, end) { // get number of days between two dates
      return Math.round((end - start) / (1000 * 60 * 60 * 24));
    },
    async getLogs(queryParams) {
      try {
        const { data } = await LogApi.getLogs(queryParams);
        return data;
      } catch (error) {
        console.error(error);
        return errorMessage(error);
      }
    },
    async getBi(queryParams) {
      try {
        const { data } = await LogApi.getBi(queryParams);
        return data;
      } catch (error) {
        console.error(error);
        return errorMessage(error);
      }
    },
  },
};
</script>

<style>
.el-row{
  margin-bottom: 10px;
}
.card-text{
  font-size: 30px;
  font-weight: 500;
}

</style>
