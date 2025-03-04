// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { render, screen } from '@testing-library/react';
import React from 'react';

import traceGenerator from '../demo/trace-generators';
import { getTraceName } from '../model/trace-viewer';
import transformTraceData from '../model/transform-trace-data';

import TracePageHeader, { TracePageHeaderEmbedProps } from './TracePageHeader';

const trace = transformTraceData(traceGenerator.trace({}));
const setup = (propOverrides?: TracePageHeaderEmbedProps) => {
  const defaultProps = {
    canCollapse: false,
    hideSummary: false,
    onSlimViewClicked: () => {},
    onTraceGraphViewClicked: () => {},
    slimView: false,
    trace,
    hideMap: false,
    timeZone: '',
    viewRange: { time: { current: [10, 20] as [number, number] } },
    updateNextViewRangeTime: () => {},
    updateViewRangeTime: () => {},
    ...propOverrides,
  };

  return render(<TracePageHeader {...defaultProps} />);
};

describe('TracePageHeader test', () => {
  it('should render a header ', () => {
    setup();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render nothing if a trace is not present', () => {
    setup({ trace: null } as TracePageHeaderEmbedProps);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryByText(/Reset Selection/)).not.toBeInTheDocument();
  });

  it('should render the trace title', () => {
    setup();
    expect(
      screen.getByRole('heading', {
        name: (content) => content.replace(/ /g, '').startsWith(getTraceName(trace!.spans).replace(/ /g, '')),
      })
    ).toBeInTheDocument();
  });

  it('should render the header items', () => {
    setup();

    const headerItems = screen.queryAllByRole('listitem');

    expect(headerItems).toHaveLength(5);
    //                                                        Year-month-day hour-minute-second
    expect(headerItems[0].textContent?.match(/Trace Start:\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3}/g)).toBeTruthy();
    expect(headerItems[1].textContent?.match(/Duration:[\d|\.][\.|\d|s][\.|\d|s]?[\d]?/)).toBeTruthy();
    expect(headerItems[2].textContent?.match(/Services:\d\d?/g)).toBeTruthy();
    expect(headerItems[3].textContent?.match(/Depth:\d\d?/)).toBeTruthy();
    expect(headerItems[4].textContent?.match(/Total Spans:\d\d?\d?\d?/)).toBeTruthy();
  });

  it('should render a <SpanGraph>', () => {
    setup();
    expect(screen.getByText(/Reset Selection/)).toBeInTheDocument();
  });

  it('shows the summary', () => {
    const { rerender } = setup();

    rerender(
      <TracePageHeader
        {...({
          trace: trace,
          viewRange: { time: { current: [10, 20] } },
        } as TracePageHeaderEmbedProps)}
      />
    );
    expect(screen.queryAllByRole('listitem')).toHaveLength(5);
  });
});
