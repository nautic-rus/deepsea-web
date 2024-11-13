import {Component, OnInit, ViewChild} from '@angular/core';
import {EleCablesService} from "../../domain/ele-cables.service";
import {TreeNode, WeightData} from "../../domain/interfaces/weight";
import _ from "underscore";
import {LanguageService} from "../../domain/language.service";
import {Table} from "primeng/table";

interface IEleCable {
  cable_id: string,
  cable_spec: string,
  from_e_id: string,
  from_e_name: string,
  from_zone_id: string,
  from_zone_name: string,
  seqid: number,
  segregation: string,
  to_e_id: string,
  to_e_name: string,
  to_zone_id: string,
  to_zone_name: string
}

@Component({
  selector: 'app-ele',
  templateUrl: './ele.component.html',
  styleUrls: ['./ele.component.css']
})
export class EleComponent implements OnInit {
  @ViewChild('tt') table: Table;
  cablesSrc = [];
  eleCablesNode:any[] = [];
  cols!: any[];
  loading: boolean = true;
  routedStatuses: any = [];
  SGRs: any = [];
  pdfLoading: boolean = false


  constructor(private eleCablesService: EleCablesService, public t: LanguageService) {
    this.eleCablesService.getCables().subscribe(res => {
      this.loading = true;
      this.cablesSrc = res;
      this.routedStatuses = new Set(res.map((x: any) => x.routed_status));
      this.SGRs = new Set(res.map((x: any) => x.segregation));
      console.log(this.routedStatuses);
      console.log(this.SGRs);
      this.table.filterGlobal(null, 'contains');
      // console.log(new Set(res.map((x: any) => x.routed_status)))
      // this.eleCablesNode = this.refactorCableData(this.cablesSrc);
    })
  }

  ngOnInit(): void {
    this.cols = [
      // {field: '', header: ''},
      {field: 'cable_id', header: 'Name', sort: true, width: '14rem'},
      {field: 'routed_status', header: 'Routed status', sort: true, width: '6rem'},
      {field: 'from_zone_id', header: 'From zone', width: '4rem'},
      {field: 'to_zone_id', header: 'To zone', width: '4rem'},
      {field: 'from_e_id', header: 'From eq', sort: true, width: '5rem'},
      {field: 'to_e_id', header: 'To eq', sort: true, width: '5rem'},
      {field: 'segregation', header: 'SGR', sort: true, width: '3rem'},
      // {field: 'cable_spec', header: 'Cable spec'},
      {field: 'section', header: 'Section', sort: true, width: '5rem'},
      {field: 'system', header: 'System', sort: true, width: '12rem'},
      {field: 'total_length', header: 'Total length', sort: true, width: '5rem'},
    ];


  }

  getRoutedStatus(statusNumber: string) {
    switch (statusNumber) {
      case ('0'):
        return 'Not routed'
      case ('1'):
        return 'Fully routed'
      case ('2'):
        return 'Partially routed'
      case ('3'):
        return 'Off routed'
      default:
        return 'Error'
    }
  }

  refactorTotalLength(length: number) {
    return  Math.round(length * 100) / 100
  }

  zoneName(zoneId: string, zoneData: IEleCable[]) {
    let f: IEleCable | undefined = zoneData.find((x: any) => x.from_zone_id === zoneId)
    if (f) {
      return f!.from_zone_name
    } else {
      let t: IEleCable | undefined = zoneData.find((x: any) => x.to_zone_id === zoneId)
      return t!.to_zone_name
    }
  }

  refactorCableData(data: IEleCable[]): any[] {
    console.log(data);
    const zone: any[] = [];
    const zoneSet = new Set(data.map(x => x.to_zone_id || x.from_zone_id));

    zoneSet.forEach(zoneId => {
      const zoneData = data.filter(x => x.from_zone_id === zoneId || x.to_zone_id === zoneId);
      console.log(zoneData);

      // const groupedByEq = _.groupBy(zoneData, (x: any) => x.from_e_id);

      const zoneItem: any = {
        data: {
          name: zoneId + ' ' + this.zoneName(zoneId, zoneData),
          segregation: '',
          cable_spec: '',
          routed_status: '',
          from_zone: '',
          to_zone: '',
          from_eq: '',
          to_eq: '',
          system: '',
          section: '',
          total_length: ''
        },
        children: zoneData.map((ch: any) => ({
          data: {
            name: ch.cable_id,
            segregation: ch.segregation,
            cable_spec: ch.cable_spec,
            routed_status: this.getRoutedStatus(ch.routed_status),
            from_zone: ch.from_zone_id + ' ',
            to_zone: ch.to_zone_id + ' ',
            from_eq: ch.from_e_id,
            to_eq: ch.to_e_id,
            system: ch.system,
            section: ch.section,
            total_length:  Math.round(ch.total_length * 100) / 100
          },
        }))
      };

      // _.forEach(groupedByEq, (groupEq: any) => {
      //   const nameEq = groupEq[0].from_e_id + ' ' + groupEq[0].from_e_name;
      //   const eqItem: any = {
      //     data: {
      //       name: nameEq,
      //       segregation: '',
      //       cable_spec: '',
      //       routed_status: '',
      //       from_zone: '',
      //       to_zone: '',
      //       from_eq: '',
      //       to_eq: '',
      //       system: '',
      //       section: '',
      //       total_length: ''
      //     },
      //     children: groupEq.map((ch: any) => ({
      //       data: {
      //         name: ch.cable_id,
      //         segregation: ch.segregation,
      //         cable_spec: ch.cable_spec,
      //         routed_status: this.getRoutedStatus(ch.routed_status),
      //         from_zone: ch.from_zone_id + ' ',
      //         to_zone: ch.to_zone_id + ' ',
      //         from_eq: ch.from_e_name,
      //         to_eq: ch.to_e_name,
      //         system: ch.system,
      //         section: ch.section,
      //         total_length:  Math.round(ch.total_length * 100) / 100
      //       },
      //     }))
      //   };
      //   zoneItem.children.push(eqItem);
      // });

      zone.push(zoneItem);
    });
    this.loading = false;
    console.log(zone);
    return zone;
  }

  createPdf() {
    this.pdfLoading = true;
    this.eleCablesService.getPdfUrl().subscribe((url) => {
      console.log("PDF res");
      console.log(url);
      window.open("/rest-d" +url, '_blank');
      this.pdfLoading = false;
      // let fileURL = 'https://deep-sea.ru/rest-d' + url;
      // console.log(fileURL);
      // window.open(fileURL, '_blank');
    })
  }
}







// import { Component, OnInit } from '@angular/core';
// import {EleCablesService} from "../../domain/ele-cables.service";
// import {TreeNode, WeightData} from "../../domain/interfaces/weight";
// import _ from "underscore";
// import {LanguageService} from "../../domain/language.service";
//
// interface IEleCable {
//   cable_id: string,
//   cable_spec: string,
//   from_e_id: string,
//   from_e_name: string,
//   from_zone_id: string,
//   from_zone_name: string,
//   seqid: number,
//   segregation: string,
//   to_e_id: string,
//   to_e_name: string,
//   to_zone_id: string,
//   to_zone_name: string
// }
//
// @Component({
//   selector: 'app-ele',
//   templateUrl: './ele.component.html',
//   styleUrls: ['./ele.component.css']
// })
// export class EleComponent implements OnInit {
//   cablesSrc = [];
//   eleCablesNode:any[] = [];
//   cols!: any[];
//   loading: boolean = true;
//
//
//   constructor(private eleCablesService: EleCablesService, public t: LanguageService) {
//     this.eleCablesService.getCables().subscribe(res => {
//       this.loading = true;
//       this.cablesSrc = res;
//       // console.log(new Set(res.map((x: any) => x.routed_status)))
//       this.eleCablesNode = this.refactorCableData(this.cablesSrc);
//     })
//   }
//
//   ngOnInit(): void {
//     this.cols = [
//       // {field: '', header: ''},
//       {field: 'name', header: 'Name', sort: true, width: '14rem'},
//       {field: 'routed_status', header: 'Routed status', sort: true, width: '6rem'},
//       {field: 'from_zone', header: 'From zone', width: '4rem'},
//       {field: 'to_zone', header: 'To zone', width: '4rem'},
//       {field: 'from_eq', header: 'From eq', sort: true, width: '5rem'},
//       {field: 'to_eq', header: 'To eq', sort: true, width: '5rem'},
//       {field: 'segregation', header: 'SGR', sort: true, width: '3rem'},
//       // {field: 'cable_spec', header: 'Cable spec'},
//       {field: 'section', header: 'Section', sort: true, width: '5rem'},
//       {field: 'system', header: 'System', sort: true, width: '12rem'},
//       {field: 'total_length', header: 'Total length', sort: true, width: '5rem'},
//
//     ];
//   }
//
//   getRoutedStatus(statusNumber: string) {
//     switch (statusNumber) {
//       case ('0'):
//         return 'Not routed'
//       case ('1'):
//         return 'Fully routed'
//       case ('2'):
//         return 'Partially routed'
//       case ('3'):
//         return 'Off routed'
//       default:
//         return 'Error'
//     }
//   }
//
//   zoneName(zoneId: string, zoneData: IEleCable[]) {
//     let f: IEleCable | undefined = zoneData.find((x: any) => x.from_zone_id === zoneId)
//     if (f) {
//       return f!.from_zone_name
//     } else {
//       let t: IEleCable | undefined = zoneData.find((x: any) => x.to_zone_id === zoneId)
//       return t!.to_zone_name
//     }
//   }
//
//   refactorCableData(data: IEleCable[]): any[] {
//     console.log(data);
//     const zone: any[] = [];
//     const zoneSet = new Set(data.map(x => x.to_zone_id || x.from_zone_id));
//
//     zoneSet.forEach(zoneId => {
//       const zoneData = data.filter(x => x.from_zone_id === zoneId || x.to_zone_id === zoneId);
//       console.log(zoneData);
//
//       // const groupedByEq = _.groupBy(zoneData, (x: any) => x.from_e_id);
//
//       const zoneItem: any = {
//         data: {
//           name: zoneId + ' ' + this.zoneName(zoneId, zoneData),
//           segregation: '',
//           cable_spec: '',
//           routed_status: '',
//           from_zone: '',
//           to_zone: '',
//           from_eq: '',
//           to_eq: '',
//           system: '',
//           section: '',
//           total_length: ''
//         },
//         children: zoneData.map((ch: any) => ({
//           data: {
//             name: ch.cable_id,
//             segregation: ch.segregation,
//             cable_spec: ch.cable_spec,
//             routed_status: this.getRoutedStatus(ch.routed_status),
//             from_zone: ch.from_zone_id + ' ',
//             to_zone: ch.to_zone_id + ' ',
//             from_eq: ch.from_e_id,
//             to_eq: ch.to_e_id,
//             system: ch.system,
//             section: ch.section,
//             total_length:  Math.round(ch.total_length * 100) / 100
//           },
//         }))
//       };
//
//       // _.forEach(groupedByEq, (groupEq: any) => {
//       //   const nameEq = groupEq[0].from_e_id + ' ' + groupEq[0].from_e_name;
//       //   const eqItem: any = {
//       //     data: {
//       //       name: nameEq,
//       //       segregation: '',
//       //       cable_spec: '',
//       //       routed_status: '',
//       //       from_zone: '',
//       //       to_zone: '',
//       //       from_eq: '',
//       //       to_eq: '',
//       //       system: '',
//       //       section: '',
//       //       total_length: ''
//       //     },
//       //     children: groupEq.map((ch: any) => ({
//       //       data: {
//       //         name: ch.cable_id,
//       //         segregation: ch.segregation,
//       //         cable_spec: ch.cable_spec,
//       //         routed_status: this.getRoutedStatus(ch.routed_status),
//       //         from_zone: ch.from_zone_id + ' ',
//       //         to_zone: ch.to_zone_id + ' ',
//       //         from_eq: ch.from_e_name,
//       //         to_eq: ch.to_e_name,
//       //         system: ch.system,
//       //         section: ch.section,
//       //         total_length:  Math.round(ch.total_length * 100) / 100
//       //       },
//       //     }))
//       //   };
//       //   zoneItem.children.push(eqItem);
//       // });
//
//       zone.push(zoneItem);
//     });
//     this.loading = false;
//     console.log(zone);
//     return zone;
//   }
//
//
//
//
//   // refactorCableData(data: IEleCable[]): any[] {
//   //   const zone: any[] = [];
//   //   const zoneSet = new Set(data.map(x => x.to_zone_id || x.from_zone_id));
//   //
//   //   zoneSet.forEach(zoneId => {
//   //     const zoneData = data.filter(x => x.from_zone_id === zoneId || x.to_zone_id === zoneId);
//   //
//   //     const groupedByEq = _.groupBy(zoneData, (x: any) => x.from_e_id);
//   //
//   //     const zoneItem: any = {
//   //       data: {
//   //         name: zoneId + ' ' + this.zoneName(zoneId, zoneData),
//   //         segregation: '',
//   //         cable_spec: '',
//   //         routed_status: '',
//   //         from_zone: '',
//   //         to_zone: '',
//   //         from_eq: '',
//   //         to_eq: '',
//   //         system: '',
//   //         section: '',
//   //         total_length: ''
//   //       },
//   //       children: []
//   //     };
//   //
//   //     _.forEach(groupedByEq, (groupEq: any) => {
//   //       const nameEq = groupEq[0].from_e_id + ' ' + groupEq[0].from_e_name;
//   //       const eqItem: any = {
//   //         data: {
//   //           name: nameEq,
//   //           segregation: '',
//   //           cable_spec: '',
//   //           routed_status: '',
//   //           from_zone: '',
//   //           to_zone: '',
//   //           from_eq: '',
//   //           to_eq: '',
//   //           system: '',
//   //           section: '',
//   //           total_length: ''
//   //         },
//   //         children: groupEq.map((ch: any) => ({
//   //           data: {
//   //             name: ch.cable_id,
//   //             segregation: ch.segregation,
//   //             cable_spec: ch.cable_spec,
//   //             routed_status: this.getRoutedStatus(ch.routed_status),
//   //             from_zone: ch.from_zone_id + ' ',
//   //             to_zone: ch.to_zone_id + ' ',
//   //             from_eq: ch.from_e_name,
//   //             to_eq: ch.to_e_name,
//   //             system: ch.system,
//   //             section: ch.section,
//   //             total_length:  Math.round(ch.total_length * 100) / 100
//   //           },
//   //         }))
//   //       };
//   //       zoneItem.children.push(eqItem);
//   //     });
//   //
//   //     zone.push(zoneItem);
//   //   });
//   //   this.loading = false;
//   //   console.log(zone);
//   //   return zone;
//   // }
//
// }
