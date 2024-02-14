import { StorageKeys, useReactiveLocalStorage } from "./localStorage";
import { JSXElement, Show } from "solid-js";

export interface Experiment {
  id: ExperimentIds;
  name: string;
  description?: string;
}

export const Experiments = [
  {
    id: "CREATE_APPS",
    name: "Create Applications",
    description: "Create applications that will allow users to create bots."
  }
] as const;

export type ExperimentIds = typeof Experiments[number]["id"];

const [enabledExperiments, setEnabledExperiments] = useReactiveLocalStorage<string[]>(StorageKeys.ENABLED_EXPERIMENTS, []);

export const ShowExperiment = (props: {experimentId?: ExperimentIds, children: JSXElement}) => {
  return (
    <Show when={!props.experimentId || enabledExperiments().includes(props.experimentId)}>
      {props.children}
    </Show>
  );
};

export const useExperiment = (experimentId: () => ExperimentIds) => {

  const experiment = () => {
    const experiment = Experiments.find(experiment => experiment.id === experimentId());
    const enabled = enabledExperiments().includes(experimentId());
    if (enabled) {
      return experiment;
    }
  };
  const toggle = () => {
    const enabled = enabledExperiments().includes(experimentId());
    if (enabled) {
      setEnabledExperiments(enabledExperiments().filter(id => id !== experimentId()));
    }    
    else {
      setEnabledExperiments([...enabledExperiments(), experimentId()]);
    }
  };

  return {
    experiment,
    toggleExperiment: toggle
  };
};