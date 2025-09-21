import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseTool } from '../../base/BaseTool';

interface StatusCode {
    code: string;
    name: string;
    description: string;
}

interface StatusCodeCategory {
    title: string;
    codes: StatusCode[];
    color: string;
}

@customElement('http-status-code')
export class HttpStatusCode extends BaseTool {
    @state() private expandedItems: Set<string> = new Set();

    private statusCategories: StatusCodeCategory[] = [
        {
            title: "1xx - Informational",
            color: "var(--vscode-charts-blue)",
            codes: [
                { code: '100', name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
                { code: '101', name: 'Switching Protocols', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.' },
                { code: '102', name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.' },
                { code: '103', name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.' },
            ]
        },
        {
            title: "2xx - Success",
            color: "var(--vscode-charts-green)",
            codes: [
                { code: '200', name: 'OK', description: 'The request has succeeded.' },
                { code: '201', name: 'Created', description: 'The request has been fulfilled and a new resource has been created.' },
                { code: '202', name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.' },
                { code: '203', name: 'Non-Authoritative Information', description: 'The returned metadata is not exactly the same as is available from the origin server.' },
                { code: '204', name: 'No Content', description: 'The server successfully processed the request, but is not returning any content.' },
                { code: '205', name: 'Reset Content', description: 'The server successfully processed the request, but is not returning any content. The requester should reset the document view.' },
                { code: '206', name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.' },
                { code: '207', name: 'Multi-Status', description: 'The message body that follows is an XML message and can contain a number of separate response codes.' },
                { code: '208', name: 'Already Reported', description: 'The members of a DAV binding have already been enumerated in a previous reply to this request.' },
                { code: '226', name: 'IM Used', description: 'The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.' },
            ]
        },
        {
            title: "3xx - Redirection",
            color: "var(--vscode-charts-yellow)",
            codes: [
                { code: '300', name: 'Multiple Choices', description: 'The request has more than one possible response. The user agent should choose one of them.' },
                { code: '301', name: 'Moved Permanently', description: 'The URL of the requested resource has been changed permanently. The new URL is given in the response.' },
                { code: '302', name: 'Found', description: 'The URI of requested resource has been changed temporarily. New changes in the URI might be made in the future.' },
                { code: '303', name: 'See Other', description: 'The server sent this response to direct the client to get the requested resource at another URI with a GET request.' },
                { code: '304', name: 'Not Modified', description: 'This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.' },
                { code: '307', name: 'Temporary Redirect', description: 'The server sends this response to direct the client to get the requested resource at another URI with the same method that was used in the prior request.' },
                { code: '308', name: 'Permanent Redirect', description: 'This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header.' },
            ]
        },
        {
            title: "4xx - Client Error",
            color: "var(--vscode-charts-orange)",
            codes: [
                { code: '400', name: 'Bad Request', description: 'The server cannot or will not process the request due to an apparent client error.' },
                { code: '401', name: 'Unauthorized', description: 'Authentication is required and has failed or has not yet been provided.' },
                { code: '402', name: 'Payment Required', description: 'Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme.' },
                { code: '403', name: 'Forbidden', description: 'The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource.' },
                { code: '404', name: 'Not Found', description: 'The server can not find the requested resource.' },
                { code: '405', name: 'Method Not Allowed', description: 'The request method is known by the server but is not supported by the target resource.' },
                { code: '406', name: 'Not Acceptable', description: 'The server cannot produce a response matching the list of acceptable values defined in the request\'s proactive content negotiation headers.' },
                { code: '407', name: 'Proxy Authentication Required', description: 'Similar to 401 Unauthorized, but it indicates that the client must first authenticate itself with the proxy.' },
                { code: '408', name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
                { code: '409', name: 'Conflict', description: 'This response is sent when a request conflicts with the current state of the server.' },
                { code: '410', name: 'Gone', description: 'This response is sent when the requested content has been permanently deleted from server, with no forwarding address.' },
                { code: '411', name: 'Length Required', description: 'Server rejected the request because the Content-Length header field is not defined and the server requires it.' },
                { code: '412', name: 'Precondition Failed', description: 'The client has indicated preconditions in its headers which the server does not meet.' },
                { code: '413', name: 'Payload Too Large', description: 'Request entity is larger than limits defined by server.' },
                { code: '414', name: 'URI Too Long', description: 'The URI requested by the client is longer than the server is willing to interpret.' },
                { code: '415', name: 'Unsupported Media Type', description: 'The media format of the requested data is not supported by the server.' },
                { code: '416', name: 'Range Not Satisfiable', description: 'The range specified by the Range header field in the request cannot be fulfilled.' },
                { code: '417', name: 'Expectation Failed', description: 'This response code means the expectation indicated by the Expect request header field cannot be met by the server.' },
                { code: '418', name: 'I\'m a teapot', description: 'The server refuses the attempt to brew coffee with a teapot.' },
                { code: '421', name: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.' },
                { code: '422', name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
                { code: '423', name: 'Locked', description: 'The resource that is being accessed is locked.' },
                { code: '424', name: 'Failed Dependency', description: 'The request failed due to failure of a previous request.' },
                { code: '425', name: 'Too Early', description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.' },
                { code: '426', name: 'Upgrade Required', description: 'The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.' },
                { code: '428', name: 'Precondition Required', description: 'The origin server requires the request to be conditional.' },
                { code: '429', name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time ("rate limiting").' },
                { code: '431', name: 'Request Header Fields Too Large', description: 'The server is unwilling to process the request because its header fields are too large.' },
                { code: '451', name: 'Unavailable For Legal Reasons', description: 'The user agent requested a resource that cannot legally be provided, such as a web page censored by a government.' },
            ]
        },
        {
            title: "5xx - Server Error",
            color: "var(--vscode-charts-red)",
            codes: [
                { code: '500', name: 'Internal Server Error', description: 'The server has encountered a situation it does not know how to handle.' },
                { code: '501', name: 'Not Implemented', description: 'The request method is not supported by the server and cannot be handled.' },
                { code: '502', name: 'Bad Gateway', description: 'This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.' },
                { code: '503', name: 'Service Unavailable', description: 'The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded.' },
                { code: '504', name: 'Gateway Timeout', description: 'This error response is given when the server is acting as a gateway and cannot get a response in time.' },
                { code: '505', name: 'HTTP Version Not Supported', description: 'The HTTP version used in the request is not supported by the server.' },
                { code: '506', name: 'Variant Also Negotiates', description: 'The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.' },
                { code: '507', name: 'Insufficient Storage', description: 'The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.' },
                { code: '508', name: 'Loop Detected', description: 'The server detected an infinite loop while processing the request.' },
                { code: '510', name: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfill it.' },
                { code: '511', name: 'Network Authentication Required', description: 'Indicates that the client needs to authenticate to gain network access.' },
            ]
        }
    ];

    static styles = css`
        ${BaseTool.styles}
    `;

    toggleExpand(code: string) {
        const newExpandedItems = new Set(this.expandedItems);
        if (newExpandedItems.has(code)) {
            newExpandedItems.delete(code);
        } else {
            newExpandedItems.add(code);
        }
        this.expandedItems = newExpandedItems;
    }

    protected renderTool() {
        return html`
            <style>
            .http-category {
                margin-bottom: 16px;
            }

            .category-title {
                margin-bottom: 8px;
                opacity: 0.8;
            }

            .http-item {
                display: flex;
                align-items: flex-start;
                min-height: 32px;
                margin-bottom: 8px;
                position: relative;
                background-color: var(--vscode-panel-background);
                box-shadow: inset 0 0 0 1px var(--vscode-panel-border);
                border-radius: 2px;
                overflow: hidden;
            }

            .http-separator {
                width: 1px;
                height: 20px;
                margin-top: 6px;
                background-color: var(--vscode-panel-border);
            }

            .http-content {
                flex: 1;
            }

            .http-value {
                flex: 1;
                padding: 6px 10px;
                word-break: break-all;
            }

            .http-description {
                padding: 0 10px 6px 10px;
                opacity: 0.75;
            }

            .http-label {
                width: 50px;
                padding: 6px 10px;
                text-align: right;
            }

            .expand-collapse-button {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                background: none;
                border: none;
                cursor: pointer;
                color: var(--vscode-foreground);
                opacity: 0.8;
            }

            .expand-collapse-button:hover {
                opacity: 1;
            }

            .hidden {
                display: none;
            }
            </style>
            <div class="tool-inner-container">
                <p class="opacity-75">HTTP status codes are standard response codes given by web servers on the Internet. They help identify the cause of the problem when a web page or other resource does not load properly.</p>
                <hr />
                
                ${this.statusCategories.map(category => this.renderCategory(category))}
            </div>
        `;
    }

    private renderCategory(category: StatusCodeCategory) {
        return html`
            <div class="http-category">
                <h3 class="category-title">${category.title}</h3>
                ${category.codes.map(item => this.renderDetailItem(item, category.color))}
            </div>
        `;
    }

    private renderDetailItem(item: StatusCode, color: string) {
        const isExpanded = this.expandedItems.has(item.code);

        return html`
            <div class="http-item">
                <div class="http-label" style="color: ${color}">${item.code}</div>
                <div class="http-separator"></div>
                <div class="http-content">
                    <div class="http-value">${item.name}</div>
                    <div class="http-description ${isExpanded ? '' : 'hidden'}">${item.description}</div>
                </div>
                <button class="expand-collapse-button" @click=${() => this.toggleExpand(item.code)}>
                ${isExpanded ?
                    html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>` :
                    html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`
                }
                </button>
            </div>
        `;
    }
}