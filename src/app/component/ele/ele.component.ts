import { Component, OnInit } from '@angular/core';
import {EleCablesService} from "../../domain/ele-cables.service";
import {TreeNode, WeightData} from "../../domain/interfaces/weight";
import _ from "underscore";
import {LanguageService} from "../../domain/language.service";

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
  cablesSrc = [];
  eleCablesNode:any[] = [];
  cols!: any[];
  loading: boolean = true;


  constructor(private eleCablesService: EleCablesService, public t: LanguageService) {
    this.eleCablesService.getCables().subscribe(res => {
      this.loading = true;
      this.cablesSrc = res;
      // console.log(new Set(res.map((x: any) => x.routed_status)))
      this.eleCablesNode = this.refactorCableData(this.cablesSrc);
    })
  }

  ngOnInit(): void {
    this.cols = [
      // {field: '', header: ''},
      {field: 'name', header: 'Name', sort: true, width: '15rem'},
      {field: 'routed_status', header: 'Routed status', width: '5rem'},
      {field: 'from_zone', header: 'From zone', width: '5rem'},
      {field: 'to_zone', header: 'To zone', width: '5rem'},
      {field: 'from_eq', header: 'From eq', width: '5rem'},
      {field: 'to_eq', header: 'To eq', width: '5rem'},
      {field: 'segregation', header: 'Segregation', width: '4rem'},
      // {field: 'cable_spec', header: 'Cable spec'},

      {field: 'section', header: 'Section', width: '3rem'},
      {field: 'system', header: 'System', width: '10rem'},
      {field: 'total_length', header: 'Total length', width: '4rem'},

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
    const zone: any[] = [];
    const zoneSet = new Set(data.map(x => x.to_zone_id || x.from_zone_id));

    zoneSet.forEach(zoneId => {
      const zoneData = data.filter(x => x.from_zone_id === zoneId || x.to_zone_id === zoneId);

      const groupedByEq = _.groupBy(zoneData, (x: any) => x.from_e_id);

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
        children: []
      };

      _.forEach(groupedByEq, (groupEq: any) => {
        const nameEq = groupEq[0].from_e_id + ' ' + groupEq[0].from_e_name;
        const eqItem: any = {
          data: {
            name: nameEq,
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
          children: groupEq.map((ch: any) => ({
            data: {
              name: ch.cable_id,
              segregation: ch.segregation,
              cable_spec: ch.cable_spec,
              routed_status: this.getRoutedStatus(ch.routed_status),
              from_zone: ch.from_zone_id + ' ',
              to_zone: ch.to_zone_id + ' ',
              from_eq: ch.from_e_name,
              to_eq: ch.to_e_name,
              system: ch.system,
              section: ch.section,
              total_length:  Math.round(ch.total_length * 100) / 100
            },
          }))
        };
        zoneItem.children.push(eqItem);
      });

      zone.push(zoneItem);
    });
    this.loading = false;
    console.log(zone);
    return zone;
  }

}
