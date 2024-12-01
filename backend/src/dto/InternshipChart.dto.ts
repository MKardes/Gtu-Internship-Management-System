
class TermResults {
    passed: number;
    failed: number;
}

export class InternShipChartDto {
    midterm_fall: TermResults;
    midterm_break: TermResults;
    midterm_spring: TermResults;
    summer: TermResults;
}