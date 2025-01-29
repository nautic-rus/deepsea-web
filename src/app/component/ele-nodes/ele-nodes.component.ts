import { Component, OnInit } from '@angular/core';
import {SpecManagerService} from "../../domain/spec-manager.service";
import _ from "underscore";
import {tap} from "rxjs/operators";
import {concat, Observable, of} from "rxjs";
import {LanguageService} from "../../domain/language.service";

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
  eleNodePNG: any;
  selectedEleNode: any;
  search = '';
  cablesLoading = '';
  previewImagePNG = '';
  loaded = -1;
  constructor(public s: SpecManagerService, public t: LanguageService) { }

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
      this.s.getEleNodePNG(this.project, node.node_id).subscribe(eleNodePNG => {
        console.log(eleNodePNG);
        this.eleNodePNG = eleNodePNG;
        this.cablesLoading = '';
      });
    });
  }

  searchNode() {
    this.eleNodes = this.eleNodesSrc.filter(x => x.node.toLowerCase().includes(this.search.toLowerCase().trim()));
  }

  previewImage(png_url: string) {
    this.previewImagePNG = png_url;
    console.log(this.previewImagePNG);
  }

  checkStatus() {
    this.loaded = 0;
    let observables = this.eleNodesSrc.map(x => this.s.checkEleNodePNG(this.project, x.node_id));
    concat(...observables).pipe(
      tap(res => {
        this.loaded++;
        let findNode = this.eleNodes.find(x => x.node_id == res[0].node_id);
        if (findNode) {
          findNode.error = res[0].error;
        }
        if (this.loaded == this.eleNodesSrc.length) {
          this.loaded = -1;
        }
      }
    )).subscribe();
  }

  getErrors() {
    return this.eleNodes.filter(x => x.error.includes('error')).length;
  }

  createPdf() {
    this.s.getEleNodePDF(this.project, this.selectedEleNode.node_id).subscribe(pdf => {
      console.log(pdf);
      window.open(pdf, '_blank');
    });
  }
}
