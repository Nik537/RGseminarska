const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uMvpMatrix;

out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

float lightness = 0.5;

void main() {
    oColor = texture(uTexture, vTexCoord) * vec4(lightness, lightness, lightness, 1);
}
`;

export const shaders = {
    simple: { vertex, fragment }
};

// const vertex = `#version 300 es

// layout (location = 0) in vec4 aPosition;
// layout (location = 1) in vec2 aTexCoord;

// uniform mat4 uMvpMatrix;

// out vec2 vTexCoord;

// void main() {
//     vTexCoord = aTexCoord;
//     gl_Position = uMvpMatrix * aPosition;
// }
// `;

// const fragment = `#version 300 es
// precision mediump float;

// uniform mediump sampler2D uTexture;

// in vec2 vTexCoord;

// out vec4 oColor;

// void main() {
//     oColor = texture(uTexture, vTexCoord);
// }
// `;

// export const shaders = {
//     simple: { vertex, fragment }
// };
