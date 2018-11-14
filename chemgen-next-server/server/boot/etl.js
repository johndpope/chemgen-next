'use strict'

module.exports = function (app, cb) {
  /*
   * These are just some general helpers for workflows - rows, columns, transforming object to find
   */
  //TODO Move these someplace else - server should just be for routing

  app.etlWorkflow = {}
  app.etlWorkflow.helpers = {}

  app.etlWorkflow.helpers.findOrCreateObj = function (data) {
    const andArray = []
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        let newObj = {}
        newObj[k] = data[k]
        andArray.push(newObj)
      }
    }

    return {
      and: andArray
    }
  }

  const listWells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12'
    ]
    const allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }

  app.etlWorkflow.helpers.all96Wells = listWells()

  app.etlWorkflow.helpers.list96Wells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12'
    ]
    let allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }
  app.etlWorkflow.helpers.list384Wells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12',
      '13', '14', '15', '16', '17', '18', '19',
      '20', '21', '22', '23', '24'
    ]
    let allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }

  app.paginateModel = function (model, query, pageSize) {
    return new Promise((resolve, reject) => {
      app.models[model]
        .count(query)
        .then((count) => {
          let totalPages = Math.round(count / pageSize)
          resolve({count: count, totalPages: totalPages + 1, limit: pageSize})
        })
        .catch((error) => {
          console.log(error)
          reject(new Error(error))
        })
    })
  }

  // 384 well plates
  app.etlWorkflow.helpers.rows384 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
  app.etlWorkflow.helpers.cols384 = ['01', '02', '03', '04', '05',
    '06', '07', '08', '09', '10', '11', '12',
    '13', '14', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24'
  ]

  // 96 Well Plates
  app.etlWorkflow.helpers.rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  app.etlWorkflow.helpers.cols = ['01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ]

  app.etlWorkflow.helpers.nyWellToTile = {
    'A01': 'Tile000001',
    'A02': 'Tile000002',
    'A03': 'Tile000003',
    'A04': 'Tile000004',
    'A05': 'Tile000005',
    'A06': 'Tile000006',
    'A07': 'Tile000007',
    'A08': 'Tile000008',
    'A09': 'Tile000009',
    'A10': 'Tile000010',
    'A11': 'Tile000011',
    'A12': 'Tile000012',
    'B01': 'Tile000024',
    'B02': 'Tile000023',
    'B03': 'Tile000022',
    'B04': 'Tile000021',
    'B05': 'Tile000020',
    'B06': 'Tile000019',
    'B07': 'Tile000018',
    'B08': 'Tile000017',
    'B09': 'Tile000016',
    'B10': 'Tile000015',
    'B11': 'Tile000014',
    'B12': 'Tile000013',
    'C01': 'Tile000025',
    'C02': 'Tile000026',
    'C03': 'Tile000027',
    'C04': 'Tile000028',
    'C05': 'Tile000029',
    'C06': 'Tile000030',
    'C07': 'Tile000031',
    'C08': 'Tile000032',
    'C09': 'Tile000033',
    'C10': 'Tile000034',
    'C11': 'Tile000035',
    'C12': 'Tile000036',
    'D01': 'Tile000048',
    'D02': 'Tile000047',
    'D03': 'Tile000046',
    'D04': 'Tile000045',
    'D05': 'Tile000044',
    'D06': 'Tile000043',
    'D07': 'Tile000042',
    'D08': 'Tile000041',
    'D09': 'Tile000040',
    'D10': 'Tile000039',
    'D11': 'Tile000038',
    'D12': 'Tile000037',
    'E01': 'Tile000049',
    'E02': 'Tile000050',
    'E03': 'Tile000051',
    'E04': 'Tile000052',
    'E05': 'Tile000053',
    'E06': 'Tile000054',
    'E07': 'Tile000055',
    'E08': 'Tile000056',
    'E09': 'Tile000057',
    'E10': 'Tile000058',
    'E11': 'Tile000059',
    'E12': 'Tile000060',
    'F01': 'Tile000072',
    'F02': 'Tile000071',
    'F03': 'Tile000070',
    'F04': 'Tile000069',
    'F05': 'Tile000068',
    'F06': 'Tile000067',
    'F07': 'Tile000066',
    'F08': 'Tile000065',
    'F09': 'Tile000064',
    'F10': 'Tile000063',
    'F11': 'Tile000062',
    'F12': 'Tile000061',
    'G01': 'Tile000073',
    'G02': 'Tile000074',
    'G03': 'Tile000075',
    'G04': 'Tile000076',
    'G05': 'Tile000077',
    'G06': 'Tile000078',
    'G07': 'Tile000079',
    'G08': 'Tile000080',
    'G09': 'Tile000081',
    'G10': 'Tile000082',
    'G11': 'Tile000083',
    'G12': 'Tile000084',
    'H01': 'Tile000096',
    'H02': 'Tile000095',
    'H03': 'Tile000094',
    'H04': 'Tile000093',
    'H05': 'Tile000092',
    'H06': 'Tile000091',
    'H07': 'Tile000090',
    'H08': 'Tile000089',
    'H09': 'Tile000088',
    'H10': 'Tile000087',
    'H11': 'Tile000086',
    'H12': 'Tile000085'
  }

  process.nextTick(cb) // Remove if you pass `cb` to an async function yourself
}
