import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SpecManagerService} from "../../../domain/spec-manager.service";
import {MenuItem, MessageService, TreeNode} from "primeng/api";
import * as _ from "underscore";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-bs-tree-nodes',
  templateUrl: './bs-tree-nodes.component.html',
  styleUrls: ['./bs-tree-nodes.component.css']
})
export class BsTreeNodesComponent implements OnInit {

  nodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  cols = [
    { field: 'NAME', header: 'Name' },
    { field: 'WEIGHT', header: 'Weight' },
    { field: 'X_COG', header: 'X' },
    { field: 'Y_COG', header: 'Y' },
    { field: 'Z_COG', header: 'Z' },
  ];
  predefinedData = [
    { project: 'P701', x: 33.391, y: 0.002, z: 7.687, weight: 3641200 },
    { project: 'P707', x: 0, y: 0, z: 0, weight: 0 },
    { project: 'N002', x: 25.122, y: -0.067, z: 7.233, weight: 1933580 },
    { project: 'N004', x: 0, y: 0, z: 0, weight: 0 },
  ];
  loading = true;
  projects: string[] = ['P701', 'P707', 'N002', 'N004'];
  project = 'N004';
  systems: any[] = [];
  summ = 0;
  measures: any[] = [
    {
      label: 'Grams',
      value: 'g'
    },
    {
      label: 'Kilograms',
      value: 'kg'
    },
    {
      label: 'Tons',
      value: 't'
    }
  ];
  measure = 't';
  globalActual = 0;
  globalXcog = 0;
  globalYcog = 0;
  globalZcog = 0;

  exportableData: any[] = [];
  bsDesignNodesSource: any[] = [];
  constructor(public router: Router, public route: ActivatedRoute, public s: SpecManagerService, public messageService: MessageService) { }

  projectChanged() {
    this.bsDesignNodesSource.splice(0, this.bsDesignNodesSource.length);
    this.loading = true;
    this.router.navigate([], {queryParams: {project: this.project}}).then(() => {
      //this.fill();
    });
  }

  preData(value: string){
    let find = this.predefinedData.find(x => x.project == this.project);
    if (find == null){
      return 0;
    }
    else{
      // @ts-ignore
      return find[value];
    }
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.project = params.project ? params.project : 'N004';
      this.s.getHullSystems(this.project).then(res => {
        this.systems = res;
      });
      this.s.getBsDesignNodes(this.project).then(res => {
        console.log(res);
        this.exportableData = res.filter(x => !(x.ATOM_NAME.includes('Electrical') && x.USERID == "")).filter(x => !(x.ATOM_NAME == 'Equipment' && x.POS == 0));
        this.summ = 0;
        let nodes: TreeNode[] = [];
        let errors1: TreeNode[] = [];
        let errors2: TreeNode[] = [];
        let errorsWeight = 0;
        let blocks: string[] = [];
        this.bsDesignNodesSource = res.filter(x => !(x.ATOM_NAME.includes('Electrical') && x.USERID == "")).filter(x => !(x.ATOM_NAME == 'Equipment' && x.POS == 0)).map(x => Object({data: x, children: []}));
        this.bsDesignNodesSource.forEach(x => {
          x.data.Y_COG *= -1;
          let dna: string = x.data.DNA.toString();
          let r = new RegExp('(U\\d{1,4}|BS\\d{1,3}|F\\d{4}|VNT\\d{1,2}|(?<=OUTFITTING\\/)[^\\/]+)');
          if (r.test(dna)){
            // @ts-ignore
            blocks.push(r.exec(dna)[0]);
            // @ts-ignore
            x.data.PATH = r.exec(dna)[0];
          }
          else{
            let r = new RegExp('(?<=BULK\\sHEADS\\/)[^\\/]+');
            if (r.test(dna)){
              // @ts-ignore
              let split = r.exec(dna)[0].split('-');
              if (split.length > 0){
                x.data.PATH = split[1];
              }
            }

            if (x.data.PATH == null || x.data.PATH == ''){
              x.data.PATH = 'UNDEFINED';
            }
          }
          if ([45, 37, 39, 32, 41, 44, 20, 48, 49, 35, 22, 21, 33, 34, 36, 38, 31].includes(x.data.ATOM_TYPE)){
            x.data.ATOM_TYPE = 100;
            x.data.ATOM_NAME = '1. Hull';
            if (x.data.BLOCK != ""){
              x.data.PATH = x.data.BLOCK;
            }
            if (x.data.PATH.startsWith('U') || x.data.PATH.startsWith('BS')){
              x.data.GLOBAL_PATH = '1.1 Units';
            }
            else if (x.data.PATH.startsWith('F')){
              x.data.GLOBAL_PATH = '1.2 Foundations';
            }
            else if (x.data.PATH.startsWith('VNT')){
              x.data.GLOBAL_PATH = '1.3 Vent channel';
            }
            else{
              x.data.GLOBAL_PATH = '1.4 Unknown';
            }
          }
          if (x.data.WEIGHT == 0){
            x.data.WARN = true;
            let error = JSON.parse(JSON.stringify(x));
            error.data.ATOM_TYPE = 101;
            error.data.ATOM_NAME = 'WEIGHT IS NULL';
            errors1.push(error);
          }
          else if (x.data.WEIGHT <= 0.1) {
            x.data.WARN = true;
            let error = JSON.parse(JSON.stringify(x));
            error.data.ATOM_TYPE = 102;
            error.data.ATOM_NAME = 'WEIGHT <= 0.1';
            errorsWeight += isNaN(error.data.WEIGHT) ? 0 : error.data.WEIGHT;
            errors2.push(error);
          }
          this.summ += isNaN(x.data.WEIGHT) ? 0 : x.data.WEIGHT;
        });


        _.forEach(_.groupBy(_.sortBy(this.bsDesignNodesSource.filter(x => x.data.ATOM_NAME == '1. Hull'), x => x.data.ATOM_NAME + x.data.NAME), x => x.data.ATOM_NAME), group => {

          let childGlobal: TreeNode[] = [];
          _.forEach(_.groupBy(_.sortBy(group, x => x.data.GLOBAL_PATH + x.data.PATH), x => x.data.GLOBAL_PATH), globalPath => {

            let childPath: TreeNode[] = [];
            _.forEach(_.groupBy(globalPath, x => x.data.PATH), path => {
              let pathActual = 0;
              let pathXcog = 0;
              let pathYcog = 0;
              let pathZcog = 0;
              path.forEach(x => {
                let w = x.data.WEIGHT;
                let xCOG = x.data.X_COG;
                let yCOG = x.data.Y_COG;
                let zCOG = x.data.Z_COG;
                pathActual += w;
                pathXcog += xCOG * w;
                pathYcog += yCOG * w;
                pathZcog += zCOG * w;
              });
              if (pathActual != 0){
                pathXcog /= pathActual;
                pathYcog /= pathActual;
                pathZcog /= pathActual;
              }
              else{
                pathXcog = 0;
                pathYcog = 0;
                pathZcog = 0;
              }

              childPath.push({
                data: {
                  NAME: path[0].data.PATH,
                  DESCRIPTION: '',
                  WEIGHT: pathActual,
                  X_COG: pathXcog,
                  Y_COG: pathYcog,
                  Z_COG: pathZcog,
                  WARN: path.find(x => x.data.WARN) != null,
                },
                children: path
              })
            });


            let globalPathActual = 0;
            let globalPathXcog = 0;
            let globalPathYcog = 0;
            let globalPathZcog = 0;
            childPath.forEach(x => {
              let w = x.data.WEIGHT;
              let xCOG = x.data.X_COG;
              let yCOG = x.data.Y_COG;
              let zCOG = x.data.Z_COG;

              globalPathActual += w;
              globalPathXcog += xCOG * w;
              globalPathYcog += yCOG * w;
              globalPathZcog += zCOG * w;

            });

            if (globalPathActual != 0){
              globalPathXcog /= globalPathActual;
              globalPathYcog /= globalPathActual;
              globalPathZcog /= globalPathActual;
            }
            else{
              globalPathXcog = 0;
              globalPathYcog = 0;
              globalPathZcog = 0;
            }


            childGlobal.push({
              data: {
                NAME: globalPath[0].data.GLOBAL_PATH,
                DESCRIPTION: '',
                WEIGHT: globalPathActual,
                X_COG: globalPathXcog,
                Y_COG: globalPathYcog,
                Z_COG: globalPathZcog,
                WARN: childPath.find(x => x.data.WARN) != null,
              },
              children: childPath
            })
          });

          let nodeActual = 0;
          let nodeXcog = 0;
          let nodeYcog = 0;
          let nodeZcog = 0;
          childGlobal.forEach(x => {
            let w = x.data.WEIGHT;
            let xCOG = x.data.X_COG;
            let yCOG = x.data.Y_COG;
            let zCOG = x.data.Z_COG;

            nodeActual += w;
            nodeXcog += xCOG * w;
            nodeYcog += yCOG * w;
            nodeZcog += zCOG * w;

          });

          if (nodeActual != 0){
            nodeXcog /= nodeActual;
            nodeYcog /= nodeActual;
            nodeZcog /= nodeActual;
          }
          else{
            nodeXcog = 0;
            nodeYcog = 0;
            nodeZcog = 0;
          }

          nodes.push({
            data: {
              NAME: group[0].data.ATOM_NAME,
              DESCRIPTION: '',
              WEIGHT: nodeActual,
              X_COG: nodeXcog,
              Y_COG: nodeYcog,
              Z_COG: nodeZcog,
              WARN: group.find(x => x.data.WARN) != null
            },
            children: childGlobal
          })
        });



        _.forEach(_.groupBy(_.sortBy(this.bsDesignNodesSource.filter(x => x.data.ATOM_NAME != '1. Hull'), x => x.data.ATOM_NAME + x.data.NAME), x => x.data.ATOM_NAME), group => {
          let weight = 0;
          group.forEach(x => {
            weight += isNaN(x.data.WEIGHT) ? 0 : x.data.WEIGHT;
          });

          let child: TreeNode[] = [];
          _.forEach(_.groupBy(_.sortBy(group, x => x.data.PATH.replace('UNDEFINED', 'z')), x => x.data.PATH), path => {
            let weight = 0;
            let childActual = 0;
            let childXcog = 0;
            let childYcog = 0;
            let childZcog = 0;
            path.forEach(x => {
              weight += isNaN(x.data.WEIGHT) ? 0 : x.data.WEIGHT;
              let w = x.data.WEIGHT;
              let xCOG = x.data.X_COG;
              let yCOG = x.data.Y_COG;
              let zCOG = x.data.Z_COG;

              childActual += w;
              childXcog += xCOG * w;
              childYcog += yCOG * w;
              childZcog += zCOG * w;

            });

            if (childActual != 0){
              childXcog /= childActual;
              childYcog /= childActual;
              childZcog /= childActual;
            }
            else{
              childXcog = 0;
              childYcog = 0;
              childZcog = 0;
            }


            let systemName = '';
            let findSystem = this.systems.find((x: any) => x.code == path[0].data.PATH);
            if (findSystem != null){
              systemName = ' - ' + findSystem.name;
            }

            child.push({
              data: {
                NAME: path[0].data.PATH + systemName,
                DESCRIPTION: '',
                WEIGHT: weight,
                X_COG: childXcog,
                Y_COG: childYcog,
                Z_COG: childZcog,
                WARN: path.find(x => x.data.WARN) != null,
              },
              children: path
            })
          });

          let nodeActual = 0;
          let nodeXcog = 0;
          let nodeYcog = 0;
          let nodeZcog = 0;
          child.forEach(x => {
            let w = x.data.WEIGHT;
            let xCOG = x.data.X_COG;
            let yCOG = x.data.Y_COG;
            let zCOG = x.data.Z_COG;

            nodeActual += w;
            nodeXcog += xCOG * w;
            nodeYcog += yCOG * w;
            nodeZcog += zCOG * w;

          });

          if (nodeActual != 0){
            nodeXcog /= nodeActual;
            nodeYcog /= nodeActual;
            nodeZcog /= nodeActual;
          }
          else{
            nodeXcog = 0;
            nodeYcog = 0;
            nodeZcog = 0;
          }

          nodes.push({
            data: {
              NAME: group[0].data.ATOM_NAME,
              DESCRIPTION: '',
              WEIGHT: weight,
              X_COG: nodeXcog,
              Y_COG: nodeYcog,
              Z_COG: nodeZcog,
              WARN: group.find(x => x.data.WARN) != null
            },
            children: child
          })
        });


        let globalActual = 0;
        let globalXcog = 0;
        let globalYcog = 0;
        let globalZcog = 0;
        nodes.forEach(x => {
          let w = x.data.WEIGHT;
          let xCOG = x.data.X_COG;
          let yCOG = x.data.Y_COG;
          let zCOG = x.data.Z_COG;

          globalActual += w;
          globalXcog += xCOG * w;
          globalYcog += yCOG * w;
          globalZcog += zCOG * w;

        });

        globalXcog /= globalActual;
        globalYcog /= globalActual;
        globalZcog /= globalActual;

        this.globalActual = globalActual;
        this.globalXcog = globalXcog;
        this.globalYcog = globalYcog;
        this.globalZcog = globalZcog;

        nodes.push({
          data: {
            NAME: 'ERRORS: WEIGHT IS NULL',
            DESCRIPTION: '',
            WEIGHT: 0,
            X_COG: 0,
            Y_COG: 0,
            Z_COG: 0,
            WARN: true
          },
          children: errors1
        });
        nodes.push({
          data: {
            NAME: 'ERRORS: WEIGHT <= 0.1',
            DESCRIPTION: '',
            WEIGHT: errorsWeight,
            X_COG: 0,
            Y_COG: 0,
            Z_COG: 0,
            WARN: true
          },
          children: errors2
        });

        this.nodes = nodes;
        this.loading = false;
      });
    });
  }


  onNodeExpand(event: any) {
    // const node = event.node;
    // node.children = this.getChild(node.data.OID);
    // this.nodes = [...this.nodes];
  }

  nonZero(value: number) {
    return value == 0 ? '' : value;
  }

  getCommonWeight(nodeId: number){
    let res = 0;
    this.bsDesignNodesSource.filter(x => x.data.PARENT_NODE == nodeId).forEach((n: any) => {
      res += n.data.WEIGHT;
      res += this.getCommonWeight(n.data.OID);
    });
    return res;
  }

  round(value: number) {
    return Math.round(value * 100) / 100;
  }
  roundWithMeasure(value: number) {
    let multiplier;
    switch (this.measure){
      case 'kg': multiplier = 1; break;
      case 'g': multiplier = 1000; break;
      case 't': multiplier = 1 / 1000; break;
      default: multiplier = 1;
    }
    return Math.round(value * multiplier * 100) / 100;
  }

  exportExcel() {
    this.exportableData.forEach(x => {
      let dna: string = x.DNA.toString();
      let r = new RegExp('(U\\d{1,4}|BS\\d{1,3}|F\\d{4}|VNT\\d{1,2}|(?<=OUTFITTING\\/)[^\\/]+)');
      if (r.test(dna)){
        // @ts-ignore
        x.PATH = r.exec(dna)[0];
      }
      else{
        let r = new RegExp('(?<=BULK\\sHEADS\\/)[^\\/]+');
        if (r.test(dna)){
          // @ts-ignore
          let split = r.exec(dna)[0].split('-');
          if (split.length > 0){
            x.PATH = split[1];
          }
        }

        if (x.PATH == null || x.PATH == ''){
          x.PATH = 'UNDEFINED';
        }
      }
      if ([45, 37, 39, 32, 41, 44, 20, 48, 49, 35, 22, 21, 33, 34, 36, 38, 31].includes(x.ATOM_TYPE)){
        x.ATOM_TYPE = 100;
        x.ATOM_NAME = 'Hull';
      }
    });
    let fileName = 'export_' + this.generateId(8) + '.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exportableData);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    XLSX.writeFile(workbook, fileName);
  }
  generateId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }
  getDate(dateLong: number) {
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }
}
