import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../domain/spec-manager.service";
import _ from "underscore";

@Component({
  selector: 'app-ele-nodes',
  templateUrl: './ele-nodes.component.html',
  styleUrls: ['./ele-nodes.component.css']
})
export class EleNodesComponent implements OnInit {

  project = 'N002';
  eleNodes: any[] = [];
  eleNodesSrc: any[] = [];
  eleNodeCables: any[] =[];
  selectedEleNode: any;
  search = '';
  cablesLoading = '';
  constructor(public s: SpecManagerService) { }

  ngOnInit(): void {
    this.s.getEleNodes(this.project).subscribe(eleNodes => {
      console.log(eleNodes);
      this.eleNodesSrc = _.sortBy(eleNodes, x => x.node);
      this.eleNodes = [...this.eleNodesSrc];
    });
  }

  selectNode(node: any) {
    this.selectedEleNode = node;
    this.cablesLoading = 'LOADING ...';
    this.eleNodeCables = [];
    this.s.getEleNodeCables(this.project, node.node_id).subscribe(nodeCables => {
      console.log(nodeCables);
      this.eleNodeCables = _.sortBy(nodeCables, x => x.cable_id);
      this.cablesLoading = '';
    });
  }

  searchNode() {
    this.eleNodes = this.eleNodesSrc.filter(x => x.node.toLowerCase().includes(this.search.toLowerCase().trim()));
  }
}
