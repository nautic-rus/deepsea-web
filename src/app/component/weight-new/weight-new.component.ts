import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {LanguageService} from "../../domain/language.service";
// import {TreeNode} from "primeng/api";
import {WeightData, TreeNode}  from  "../../domain/interfaces/weight"

// @ts-ignore
import * as _ from 'lodash';

@Component({
  selector: 'app-weight-new',
  templateUrl: './weight-new.component.html',
  styleUrls: ['./weight-new.component.css']
})


export class WeightNewComponent implements OnInit {

  projects: any[] = [];
  selectedProjects: string[] | null= [];
  selectedProjectsLength: number | undefined = 0;
  groupBy: string = 'materials';
  weightData: any[] = [];
  cols!: any[];
  show: any[];
  departmentTreeArray: any[];
  roomTreeArray: any[];
  materialTreeArray: any[];
  parsedMatDir: any[] = [];

  constructor(public issueManager: IssueManagerService, public t: LanguageService) { }

  ngOnInit(): void {
    this.issueManager.getProjectNamesD().subscribe((res) => {
      res.forEach(i => {
        if (i.name != 'NR004') {
          this.projects.push(i.name);
        }
      })
      // console.log(this.projects)
    })




    this.cols = [
      { field: 'name', header: 'Name', visible: true, width: '300px' },
      { field: 'status', header: 'Status', visible: this.groupBy === 'department', width: '80px' },
      { field: 'doc_number', header: 'Document', visible: this.groupBy === 'rooms' || this.groupBy === 'materials', width: '80px' },
      { field: 'perc', header: '%', visible: true, width: '100px'},
      { field: 't_weight', header: 'Weight, kg', visible: true, width: '100px' },
      { field: 'x_cog', header: 'X, m', visible: true, width: '100px' },
      { field: 'y_cog', header: 'Y, m', visible: true, width: '100px' },
      { field: 'z_cog', header: 'Z, m', visible: true, width: '100px' },
      { field: 'mx', header: 'Mx, t*m', visible: true, width: '100px' },
      { field: 'my', header: 'My, t*m', visible: true, width: '100px' },
      { field: 'mz', header: 'Mz, t*m', visible: true, width: '100px' },
      { field: 'date', header: 'Modify date', visible: true, width: '100px' },
      { field: 'stock_code', header: 'Stock code', visible: true, width: '120px' },
      // pers: null, weight: null, x: null, y: null, z: null, mx: null, my: null, mz: null, modify: null, stock_kode: null
    ];

    this.fillProjects();
    this.selectedProjects?.forEach(project => {
      this.showWeightData(project);
    })
    // this.projectChanged()
  }

  fillProjects() {
    this.selectedProjects = localStorage.getItem('selectedProjectsWeight')!.split(',');
    this.selectedProjectsLength = this.selectedProjects?.length;
  }

  projectChanged(e:any) {
    // @ts-ignore
    localStorage.setItem('selectedProjectsWeight', this.selectedProjects);
    // console.log(this.selectedProjectsLength);
    // console.log(e.value)
    if (this.selectedProjectsLength! < e.value.length) {  //то есть мы выбрали еще один, то

      console.log("Добавляю новое")
      this.showWeightData(e.itemValue);
    } else {  //то есть мы удалили
      console.log("Удаляю данные проекта " + e.itemValue)
      this.weightData = this.weightData.filter(x => x.project != e.itemValue);
      this.fillWeightDataBy();
      // this.departmentTreeArray = this.fillWeightDataByDepartment(this.weightData);
    }
    this.fillProjects();
  }

  showWeightData(project: string) {
    console.log("showWeightData");
    this.issueManager.getWeightDataByProject(project).subscribe(res => {
      this.weightData.push( ...res);
      console.log(this.weightData);
      this.fillWeightDataBy()


    })
  }

  fillWeightDataBy() {
    this.departmentTreeArray = this.fillWeightDataByDepartment(this.weightData);
    // console.log("this.departmentTreeArray");
    // console.log(this.departmentTreeArray);
    this.roomTreeArray = this.fillWeightDataByRooms(this.weightData);
    // console.log("this.roomTreeArray");
    // console.log(this.roomTreeArray);
    this.fillWeightDataByMaterial(this.weightData)
  }

  parseToTreeByDepartment(): TreeNode[] {
    const departments = _.uniq(_.map(this.weightData, 'department'));

    return departments.map((dep:any) => ({
      data: { name: dep },
      children: this.docnumberChildren(dep),
    }));
  }

  docnumberChildren(dep: string): TreeNode[] {
    const departmentData = this.weightData.filter((i) => i.department === dep);
    const docNumbers = _.uniq(_.map(departmentData, 'doc_number'));

    return docNumbers.map((doc_number:any) => ({
      data: { name: doc_number },
      children: this.taskChildren(departmentData.filter((i) => i.doc_number === doc_number)),
    }));
  }

  taskChildren(sorceArray: WeightData[]): TreeNode[] {
    return sorceArray.map((i) => ({
      data: {
        name: i.name,
        status: i.status,
        perc: i.perc,
        t_weight: i.t_weight,
        x_cog: i.x_cog,
        y_cog: i.y_cog,
        z_cog: i.z_cog,
        mx: i.mx,
        my: i.my,
        mz: i.mz,
        date: i.date,
        stock_code: i.stock_code,
      },
    }));
  }


  fillWeightDataByDepartment(data: WeightData[]): TreeNode[] {
    const deps: TreeNode[] = [];

    _.forEach(_.groupBy(data, (x:any) => x.department), (groupDep:any) => {
      const name = groupDep[0].department;
      let perc = 0;
      let t_weight = 0;
      let x_cog = 0;
      let y_cog = 0;
      let z_cog = 0;
      let mx = 0;
      let my = 0;
      let mz = 0;

      groupDep.forEach((e:any) => {
        perc += e.perc;
        t_weight += e.t_weight;
        x_cog += e.x_cog;
        y_cog += e.y_cog;
        z_cog += e.z_cog;
        mx += e.mx;
        my += e.my;
        mz += e.mz;
      });

      const docs: TreeNode[] = [];
      _.forEach(_.groupBy(groupDep, (x:any) => x.doc_number), (groupDocNumber:any) => {
        const nameDoc = groupDocNumber[0].doc_number + ' ' + groupDocNumber[0].issue_name;
        let weightDoc = 0;
        let perDoc = 0;
        let xDoc = 0;
        let yDoc = 0;
        let zDoc = 0;
        let mxDoc = 0;
        let myDoc = 0;
        let mzDoc = 0;

        groupDocNumber.forEach((e:any) => {
          weightDoc += e.t_weight;
          perDoc += e.perc;
          xDoc += e.x_cog;
          yDoc += e.y_cog;
          zDoc += e.z_cog;
          mxDoc += e.mx;
          myDoc += e.my;
          mzDoc += e.mz;
        });

        docs.push({
          data: {
            name: nameDoc,
            perc: perDoc,
            t_weight: weightDoc,
            x_cog: xDoc,
            y_cog: yDoc,
            z_cog: zDoc,
            mx: mxDoc,
            my: myDoc,
            mz: mzDoc,
          },
          children: groupDocNumber.map((ch:any) => ({
            data: {
              name: ch.name,
              status: ch.status,
              perc: ch.perc,
              t_weight: ch.t_weight,
              x_cog: ch.x_cog,
              y_cog: ch.y_cog,
              z_cog: ch.z_cog,
              mx: ch.mx,
              my: ch.my,
              mz: ch.mz,
              date: ch.date,
              stock_code: ch.stock_code,
            },
          })),
        });
      });

      deps.push({
        data: {
          name,
          perc,
          t_weight,
          x_cog,
          y_cog,
          z_cog,
          mx,
          my,
          mz,
        },
        children: docs,
      });
    });

    return deps;
  }


  fillWeightDataByRooms(data: WeightData[]): TreeNode[] {
    const rooms: TreeNode[] = [];

    // Group by room
    const groupedByRoom = _.groupBy(data, (x:any) => x.room);

    for (const roomName in groupedByRoom) {
      const roomData = groupedByRoom[roomName];

      // Calculate room totals
      let roomPerc = 0;
      let roomWeight = 0;
      let roomX = 0;
      let roomY = 0;
      let roomZ = 0;
      let roomMx = 0;
      let roomMy = 0;
      let roomMz = 0;

      roomData.forEach((e:any) => {
        roomPerc += e.perc;
        roomWeight += e.t_weight;
        roomX += e.x_cog;
        roomY += e.y_cog;
        roomZ += e.z_cog;
        roomMx += e.mx;
        roomMy += e.my;
        roomMz += e.mz;
      });

      const roomNode: TreeNode = {
        data: {
          name: roomName,
          perc: roomPerc,
          t_weight: roomWeight,
          x_cog: roomX,
          y_cog: roomY,
          z_cog: roomZ,
          mx: roomMx,
          my: roomMy,
          mz: roomMz,
        },
        children: roomData.map((ch:any) => ({
          data: {
            name: ch.name,
            doc_number: ch.doc_number,
            perc: ch.perc,
            t_weight: ch.t_weight,
            x_cog: ch.x_cog,
            y_cog: ch.y_cog,
            z_cog: ch.z_cog,
            mx: ch.mx,
            my: ch.my,
            mz: ch.mz,
            date: ch.date,
            stock_code: ch.stock_code,
          },
        })),
      };

      rooms.push(roomNode);
    }

    // console.log(rooms);
    return rooms;
  }

  fillWeightDataByMaterial(data: WeightData[]): any {
    console.log("fillWeightDataByMaterial");
    this.issueManager.getMaterialsDirectory(0).subscribe(res0 => {
      this.issueManager.getMaterialsDirectory(1).subscribe(res => {
        this.parsedMatDir = [];
        this.parsedMatDir = this.parseMaterialDirectoryArrayToTree(res0.concat(res), 0, this.parsedMatDir)
        console.log("this.parsedMatDir")
        console.log(this.parsedMatDir);
      })
    })

  }


  parseMaterialDirectoryArrayToTree(rootNodes: any[], parent_id: number, resParsedArray: any[]) {
    rootNodes.filter(x => x.parent_id == parent_id).forEach(n => {
      let nodes = this.parseMaterialDirectoryArrayToTree(rootNodes, n.id, []);
      let arr = this.weightData.filter(x => x.directory_id === n.id);
      let a = arr.map(a => {return {data: a, children: []}});
      resParsedArray.push({
        data: arr.length === 0 ? _.merge(n, this.calcChildData(nodes)) : _.merge(n, this.calculateMatData(arr)),
        children: arr.length === 0 ? nodes : a
      })
    })
    return resParsedArray
  }

  calcChildData(nodes: any[]) {  //это чтобы собрать данные по детям
    console.log(nodes);
    let t_weight = 0;
    let x_cog = 0;
    let y_cog = 0;
    let z_cog = 0;
    let mx = 0;
    let my = 0;
    let mz = 0;
    let perc = 0;
    nodes.forEach(node => {
          if (node.data) {
            t_weight += node.data.t_weight;
            x_cog += node.data.x_cog;
            y_cog += node.data.y_cog;
            z_cog += node.data.z_cog;
            mx += node.data.mx;
            my += node.data.my;
            mz += node.data.mz;
            perc += node.data.perc;
          }
  })
    return {t_weight: t_weight, x_cog: x_cog, y_cog: y_cog, z_cog: z_cog, mx: mx, my: my, mz: mz, perc: perc};
  }

  calculateMatData(arr: any[]) {  //это для данных по весам для конкретного ребенка
    let weight = arr.reduce((a, b) => a + b.t_weight, 0);
    let x_cog = arr.reduce((a, b) => a + b.x_cog, 0);
    let y_cog = arr.reduce((a, b) => a + b.y_cog, 0);
    let z_cog = arr.reduce((a, b) => a + b.z_cog, 0);
    let mx = arr.reduce((a, b) => a + b.mx, 0);
    let my = arr.reduce((a, b) => a + b.my, 0);
    let mz = arr.reduce((a, b) => a + b.mz, 0);
    let perc = arr.reduce((a, b) => a + b.perc, 0);
    return {t_weight: weight, x_cog: x_cog, y_cog: y_cog, z_cog: z_cog, mx: mx, my: my, mz: mz, perc: perc};
  }


  getDateOnly(dateLong: number): string{
    if (!dateLong) {
      return '';
    }
    let date = new Date(dateLong);
    return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
  }

  groupByFunction(group: string) {
    this.groupBy = group;
    // console.log(this.groupBy);
    // this.fillWeightDataBy();
  }

}
