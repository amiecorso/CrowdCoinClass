import React, { Component } from "react";
import factory from "../ethereum/factory";

class CampaignIndex extends Component {
  render() {
    return <div>{this.props.campaigns[0]}</div>;
  }
}

export async function getStaticProps() {
  const campaigns = await factory.methods.getDeployedCampaigns().call();
  return { props: { campaigns } };
}

export default CampaignIndex;
