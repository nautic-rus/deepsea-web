import { Component, OnInit } from '@angular/core';
import {IssueManagerService} from "../../domain/issue-manager.service";
import {LanguageService} from "../../domain/language.service";
import _, {any} from "underscore";
// import {TreeNode} from "primeng/api";
import {WeightData, TreeNode}  from  "../../domain/interfaces/weight"

@Component({
  selector: 'app-weight-new',
  templateUrl: './weight-new.component.html',
  styleUrls: ['./weight-new.component.css']
})


export class WeightNewComponent implements OnInit {

  projects: any[] = [];
  selectedProjects: string[] | null= [];
  groupBy: string;
  weightData: any[] = [];
  weightDataSrc: any[] = [];
  treeNode: any[] = [];

  //treeTable
  uniqueDepartments: any[] = [];
  parsedByDepartment: TreeNode[] = [];
  cols!: any[];
  show: any[];
  departmentTreeArray: any[];

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
      { field: 'name', header: 'name' },
      { field: 'status', header: 'status' },
      { field: 'perc', header: 'perc' },
      { field: 'weight', header: 'weight' },
      { field: 'x', header: 'x' },
      { field: 'y', header: 'y' },
      { field: 'z', header: 'z' },
      { field: 'mx', header: 'mx' },
      { field: 'my', header: 'my' },
      { field: 'mz', header: 'mz' },
      { field: 'modify', header: 'modify' },
      { field: 'stock_code', header: 'stock_code' },
      // pers: null, weight: null, x: null, y: null, z: null, mx: null, my: null, mz: null, modify: null, stock_kode: null
    ];
    this.projectChanged()
  }

  // projectChanged(e:any) {
  projectChanged() {
    this.issueManager.getWeightDataByProject('NR002').subscribe(res => {
      this.weightDataSrc = res;
      this.weightData = this.weightDataSrc;

      // this.fillWeightData(this.weightData);

      this.issueManager.getWeightDataByProject('170701').subscribe(res => {
        console.log(res)
        res.forEach((i: any) => {
          this.weightData.push(i)
        })

        // const treeBuilder = this.parseToTreeByDepartment();
        // console.log(treeBuilder)
        // this.weightData.push(res)
        // console.log(this.weightData);
        // this.uniqueDepartments = [...new Set(this.weightData.map(obj => obj.department))];
        // console.log(this.uniqueDepartments);


        // this.show = this.parseToTreeByDepartment();
        // console.log(this.show)
        this.departmentTreeArray = this.fillWeightData(this.weightData)
        console.log(this.departmentTreeArray)
      })

    })
    // console.log(e)
  }

  parseToTreeByDepartment(): TreeNode[] {
    const departments = _.uniq(_.map(this.weightData, 'department'));

    return departments.map((dep) => ({
      data: { name: dep },
      children: this.docnumberChildren(dep),
    }));
  }

  docnumberChildren(dep: string): TreeNode[] {
    const departmentData = this.weightData.filter((i) => i.department === dep);
    const docNumbers = _.uniq(_.map(departmentData, 'doc_number'));

    return docNumbers.map((doc_number) => ({
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
        weight: i.t_weight,
        x: i.x_cog,
        y: i.y_cog,
        z: i.z_cog,
        mx: i.mx,
        my: i.my,
        mz: i.mz,
        modify: i.date,
        stock_code: i.stock_code,
      },
    }));
  }


  fillWeightData(data: WeightData[]): TreeNode[] {
    const deps: TreeNode[] = [];

    _.forEach(_.groupBy(data, (x) => x.department), (groupDep) => {
      const name = groupDep[0].department;
      let perc = 0;
      let weight = 0;
      let x = 0;
      let y = 0;
      let z = 0;
      let mx = 0;
      let my = 0;
      let mz = 0;

      groupDep.forEach((e) => {
        perc += e.perc;
        weight += e.t_weight;
        x += e.x_cog;
        y += e.y_cog;
        z += e.z_cog;
        mx += e.mx;
        my += e.my;
        mz += e.mz;
      });

      const docs: TreeNode[] = [];
      _.forEach(_.groupBy(groupDep, (x) => x.doc_number), (groupDocNumber) => {
        console.log(groupDocNumber);
        console.log(groupDocNumber[0]);
        const nameDoc = groupDocNumber[0].doc_number + ' ' + groupDocNumber[0].issue_name;
        let weightDoc = 0;
        let xDoc = 0;
        let yDoc = 0;
        let zDoc = 0;
        let mxDoc = 0;
        let myDoc = 0;
        let mzDoc = 0;

        groupDocNumber.forEach((e) => {
          weightDoc += e.t_weight;
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
            perc: weightDoc,
            weight: weightDoc,
            x: xDoc,
            y: yDoc,
            z: zDoc,
            mx: mxDoc,
            my: myDoc,
            mz: mzDoc,
          },
          children: groupDocNumber.map((ch) => ({
            data: {
              name: ch.name,
              status: ch.status,
              perc: ch.perc,
              weight: ch.t_weight,
              x: ch.x_cog,
              y: ch.y_cog,
              z: ch.z_cog,
              mx: ch.mx,
              my: ch.my,
              mz: ch.mz,
              modify: ch.date,
              stock_code: ch.stock_code,
            },
          })),
        });
      });

      deps.push({
        data: {
          name,
          perc,
          weight,
          x,
          y,
          z,
          mx,
          my,
          mz,
        },
        children: docs,
      });
    });

    return deps;
  }
  //
  // fillWeightData(data: any[]){
  //   let deps:any[] = [];
  //   // @ts-ignore
  //   let docs = [];
  //   _.forEach(_.groupBy(data, x => x.department), groupDep => {
  //     let name = groupDep[0].department;
  //     let weight = 0;
  //     let x = 0;
  //
  //     groupDep.forEach(e => {
  //       weight += e.weight;
  //       x += e.x;
  //     });
  //
  //     _.forEach(_.groupBy(groupDep, x => x.doc_number), groupDocNumber => {
  //       let nameDoc = groupDep[0].department;
  //       let weightDoc = 0;
  //       let xDoc = 0;
  //
  //       groupDocNumber.forEach(e => {
  //         weightDoc += e.weight;
  //         xDoc += e.x;
  //       });
  //
  //
  //       docs.push({nameDoc, weightDoc, xDoc, children: groupDocNumber.map(ch => {
  //         console.log(ch);
  //           return {name: ch.name, x: ch.x, weight: ch.weight}
  //         })});
  //
  //     });
  //
  //     // @ts-ignore
  //     deps.push({name, weight, x, docs})
  //   });
  //   console.log("deps")
  //   console.log(deps)
  //
  // }
  // parseToTreeByDepartment() {
  //   let rez: any[] = [];
  //
  //   this.uniqueDepartments.forEach(dep => {
  //     // let node = {data: null, children: null}
  //     let node = {data: null, children: null}
  //     let nodeD = {name: dep, status: null, perc: null, weight: null, x: null, y: null, z: null, mx: null, my: null, mz: null, modify: null, stock_code: null};
  //     // @ts-ignore
  //     node.data = nodeD;
  //     // @ts-ignore
  //     node.children = this.docnumberChildren(dep);
  //     rez.push(node)
  //   })
  //   return rez;
  // }

  // docnumberChildren(dep: string) {
  //   let rez: any[] = [];
  //   let soure = this.weightData.filter(i => i.department === dep);
  //   let uniqDocNumber = [...new Set(soure.map(obj => obj.doc_number))]
  //   uniqDocNumber.forEach(doc_number => {
  //     let node = {data: null, children: null}
  //     let nodeD = {name: doc_number, status: null, perc: null, weight: null, x: null, y: null, z: null, mx: null, my: null, mz: null, modify: null, stock_code: null};
  //     // @ts-ignore
  //     node.data = nodeD;
  //     // @ts-ignore
  //     node.children = this.taskChildren(soure.filter(i=> i.doc_number === doc_number))
  //     rez.push(node)
  //   })
  //   return rez
  // }
  //
  // taskChildren(sorceArray: any[]) {
  //   let rez: any[] = [];
  //   let node = {data: null};
  //   sorceArray.forEach(i => {
  //     let nodeD = {name: i.name, status: i.status, perc: i.perc, weight: i.t_weight, x: i.x_cog, y: i.y_cog, z: i.z_cog, mx: i.mx, my: i.my, mz: i.mz, modify: i.date, stock_code: i.stock_code};
  //     // @ts-ignore
  //     node.data = nodeD;
  //     rez.push(node)
  //   })
  //   return rez;
  // }




















  groupByFunction(group: string) {
    this.groupBy = group;
    console.log(this.groupBy)
  }

}
